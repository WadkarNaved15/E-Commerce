import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { validationResult } from "express-validator";
import { getSynonyms, getCategoryMappings } from "../middlewares/Functions.js"; 
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from "url";
import { decryptData , encryptData } from "./Encryption.js";
import natural from 'natural'; // Import the PorterStemmer from natural
import pluralize from 'pluralize'; // Importing pluralize library for handling plural forms

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const {PorterStemmer} = natural;
// Process terms to include both singular and plural forms
const processTerms = (terms) => {
    const uniqueTerms = new Set(terms.flatMap(term => {
        const stemmed = PorterStemmer.stem(term);
        const plural = pluralize.plural(term);
        const singular = pluralize.singular(term);
        return [stemmed, plural, singular].map(t => PorterStemmer.stem(t)); // Ensure stemming
    }));

    return Array.from(uniqueTerms);
};


export const getAllProducts = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { encryptedData } = req.body;
    const decryptedData = decryptData(encryptedData);
    const parsedData = JSON.parse(decryptedData);
    const { category, brand, sort = 'asc', search, page = 1, perPage = 6 } = parsedData;

    let query = {};
    let regexSearch = new RegExp('');

    if (category) {
        query.$or = [
            { category: category },
            { subcategory: category }
        ];
    }

    if (brand) {
        query.brand = brand;
    }

    let searchTerms = [];
    let maxPrice;

    const escapeRegex = (string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escapes special characters
    };

    if (search) {
        const underRegex = /under\s+(\d+)/i;
        const underMatch = search.match(underRegex);

        searchTerms = search.split(/\s+/);

        if (underMatch) {
            maxPrice = parseInt(underMatch[1], 10);
            query.price = { $lte: maxPrice };
            searchTerms = search.replace(underRegex, '').trim().split(/\s+/);
        }

        searchTerms = searchTerms.flatMap(term => getSynonyms(term).map(escapeRegex));

        let categoryMappings = getCategoryMappings(searchTerms);
        categoryMappings = [...new Set(categoryMappings)];

        regexSearch = new RegExp(searchTerms.map(term => `\\b${term}\\b`).join('|'), 'i');

        query.$or = [
            { name: { $regex: regexSearch } },
            { category: { $regex: regexSearch } },
            { subcategory: { $regex: regexSearch } },
            {
                specifications: {
                    $elemMatch: {
                        key: { $regex: regexSearch },
                        value: { $regex: regexSearch }
                    }
                }
            },
            ...categoryMappings.map(cat => ({ category: { $regex: `^${escapeRegex(cat)}$`, $options: 'i' } })),
            { keywords: { $in: searchTerms } } // Updated to handle the keywords array
        ];
    }

    try {
        let pipeline = [];

        if (Object.keys(query).length === 0) {
            pipeline = [
                {
                    $addFields: {
                        isOutOfStock: { $eq: ['$stock', 0] }
                    }
                },
                {
                    $sort: {
                        isOutOfStock: -1,
                        name: 1
                    }
                }
            ];
        } else {
    pipeline = [
        { $match: query },
        {
            $addFields: {
                // Assign priorities based on matches
                priorityCategory: {
                    $cond: {
                        if: {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: searchTerms,
                                            as: 'term',
                                            cond: {
                                                $regexMatch: {
                                                    input: {
                                                        $convert: {
                                                            input: { $toString: '$category' },
                                                            to: 'string',
                                                            onError: null
                                                        }
                                                    },
                                                    regex: { $concat: ['\\b', '$$term', '\\b'] },
                                                    options: 'i'
                                                }
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        },
                        then: 3, // Example priority value for category
                        else: 0
                    }
                },
                prioritySubcategory: {
                    $cond: {
                        if: {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: searchTerms,
                                            as: 'term',
                                            cond: {
                                                $regexMatch: {
                                                    input: {
                                                        $convert: {
                                                            input: { $toString: '$subcategory' },
                                                            to: 'string',
                                                            onError: null
                                                        }
                                                    },
                                                    regex: { $concat: ['\\b', '$$term', '\\b'] },
                                                    options: 'i'
                                                }
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        },
                        then: 3, // Example priority value for subcategory
                        else: 0
                    }
                },
                priorityBrand: {
                    $cond: {
                        if: {
                            $gt: [
                                {
                                    $size: {
                                        $filter: {
                                            input: searchTerms,
                                            as: 'term',
                                            cond: {
                                                $regexMatch: {
                                                    input: {
                                                        $convert: {
                                                            input: { $toString: '$brand' },
                                                            to: 'string',
                                                            onError: null
                                                        }
                                                    },
                                                    regex: { $concat: ['\\b', '$$term', '\\b'] },
                                                    options: 'i'
                                                }
                                            }
                                        }
                                    }
                                },
                                0
                            ]
                        },
                        then: 3, // Example priority value for brand
                        else: 0
                    }
                },

                // Ensure numeric values are used for calculations
                priorityScore: {
                    $add: [
                        { $ifNull: [{ $toDouble: '$priorityCategory' }, 0] },
                        { $ifNull: [{ $toDouble: '$prioritySubcategory' }, 0] },
                        { $ifNull: [{ $toDouble: '$priorityBrand' }, 0] }
                    ]
                },
                // Debugging: Show calculated priority score and matched words
                debugPriorityScore: {
                    $add: [
                        { $ifNull: [{ $toDouble: '$priorityCategory' }, 0] },
                        { $ifNull: [{ $toDouble: '$prioritySubcategory' }, 0] },
                        { $ifNull: [{ $toDouble: '$priorityBrand' }, 0] }
                    ]
                },
                matchedWords: {
                    $setUnion: [
                        {
                            $filter: {
                                input: searchTerms,
                                as: 'term',
                                cond: {
                                    $regexMatch: {
                                        input: {
                                            $convert: {
                                                input: { $toString: '$name' },
                                                to: 'string',
                                                onError: null
                                            }
                                        },
                                        regex: { $concat: ['\\b', '$$term', '\\b'] },
                                        options: 'i'
                                    }
                                }
                            }
                        },
                        {
                            $filter: {
                                input: searchTerms,
                                as: 'term',
                                cond: {
                                    $regexMatch: {
                                        input: {
                                            $convert: {
                                                input: { $toString: '$category' },
                                                to: 'string',
                                                onError: null
                                            }
                                        },
                                        regex: { $concat: ['\\b', '$$term', '\\b'] },
                                        options: 'i'
                                    }
                                }
                            }
                        },
                        {
                            $filter: {
                                input: searchTerms,
                                as: 'term',
                                cond: {
                                    $regexMatch: {
                                        input: {
                                            $convert: {
                                                input: { $toString: '$subcategory' },
                                                to: 'string',
                                                onError: null
                                            }
                                        },
                                        regex: { $concat: ['\\b', '$$term', '\\b'] },
                                        options: 'i'
                                    }
                                }
                            }
                        },
                        {
                            $filter: {
                                input: searchTerms,
                                as: 'term',
                                cond: {
                                    $or: [
                                        {
                                            $regexMatch: {
                                                input: {
                                                    $convert: {
                                                        input: { $arrayElemAt: ['$specifications.key', 0] },
                                                        to: 'string',
                                                        onError: null
                                                    }
                                                },
                                                regex: { $concat: ['\\b', '$$term', '\\b'] },
                                                options: 'i'
                                            }
                                        },
                                        {
                                            $regexMatch: {
                                                input: {
                                                    $convert: {
                                                        input: { $arrayElemAt: ['$specifications.value', 0] },
                                                        to: 'string',
                                                        onError: null
                                                    }
                                                },
                                                regex: { $concat: ['\\b', '$$term', '\\b'] },
                                                options: 'i'
                                            }
                                        }
                                    ]
                                }
                            }
                        },
                        {
                            $filter: {
                                input: searchTerms,
                                as: 'term',
                                cond: {
                                    $in: ['$$term', '$keywords']
                                }
                            }
                        }
                    ]
                },
                matchCount: {
                    $size: {
                        $setUnion: [
                            {
                                $filter: {
                                    input: searchTerms,
                                    as: 'term',
                                    cond: {
                                        $regexMatch: {
                                            input: {
                                                $convert: {
                                                    input: { $toString: '$name' },
                                                    to: 'string',
                                                    onError: null
                                                }
                                            },
                                            regex: { $concat: ['\\b', '$$term', '\\b'] },
                                            options: 'i'
                                        }
                                    }
                                }
                            },
                            {
                                $filter: {
                                    input: searchTerms,
                                    as: 'term',
                                    cond: {
                                        $regexMatch: {
                                            input: {
                                                $convert: {
                                                    input: { $toString: '$category' },
                                                    to: 'string',
                                                    onError: null
                                                }
                                            },
                                            regex: { $concat: ['\\b', '$$term', '\\b'] },
                                            options: 'i'
                                        }
                                    }
                                }
                            },
                            {
                                $filter: {
                                    input: searchTerms,
                                    as: 'term',
                                    cond: {
                                        $regexMatch: {
                                            input: {
                                                $convert: {
                                                    input: { $toString: '$subcategory' },
                                                    to: 'string',
                                                    onError: null
                                                }
                                            },
                                            regex: { $concat: ['\\b', '$$term', '\\b'] },
                                            options: 'i'
                                        }
                                    }
                                }
                            },
                            {
                                $filter: {
                                    input: searchTerms,
                                    as: 'term',
                                    cond: {
                                        $regexMatch: {
                                            input: {
                                                $convert: {
                                                    input: { $arrayElemAt: ['$specifications.key', 0] },
                                                    to: 'string',
                                                    onError: null
                                                }
                                            },
                                            regex: { $concat: ['\\b', '$$term', '\\b'] },
                                            options: 'i'
                                        }
                                    }
                                }
                            },
                            {
                                $filter: {
                                    input: searchTerms,
                                    as: 'term',
                                    cond: {
                                        $regexMatch: {
                                            input: {
                                                $convert: {
                                                    input: { $arrayElemAt: ['$specifications.value', 0] },
                                                    to: 'string',
                                                    onError: null
                                                }
                                            },
                                            regex: { $concat: ['\\b', '$$term', '\\b'] },
                                            options: 'i'
                                        }
                                    }
                                }
                            },
                            {
                                $filter: {
                                    input: searchTerms,
                                    as: 'term',
                                    cond: {
                                        $in: ['$$term', '$keywords']
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        },
        {
            $project: {
                product: '$$ROOT',
                matchCount: 1,
                matchedWords: 1,
                _id: 0,
                priorityScore: {
                    $add: [
                        { $ifNull: [{ $toDouble: '$priorityCategory' }, 0] },
                        { $ifNull: [{ $toDouble: '$prioritySubcategory' }, 0] },
                        { $ifNull: [{ $toDouble: '$priorityBrand' }, 0] }
                    ]
                }
            }
        },
        {
            $sort: {
                priorityScore: -1,
                matchCount: -1
            }
        },
        {
            $skip: (page - 1) * perPage
        },
        {
            $limit: perPage
        }
    ];
}

        

        const results = await Product.aggregate(pipeline)
            .collation({ locale: 'en', strength: 2 })
            .exec();

       console.log(results)
        const totalProducts = await Product.countDocuments(query);

        const encryptedResponse = encryptData(JSON.stringify({ products: results, total: totalProducts }));

        res.status(200).json({
            success: true,
            data: encryptedResponse
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products'
        });
    }
};



export const getProduct = async (req, res) => {
        const { encryptedData } = req.body;
        const decryptedData = decryptData(encryptedData);
        const parsedData = JSON.parse(decryptedData);
        const { id, name } = parsedData;

        let product;

        if (id) {
            // Find product by ID if `id` is provided
            product = await Product.findById(id);
        } else if (name) {
            // Find product by name if `name` is provided
            product = await Product.findOne({ name: name });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Either id or name must be provided',
            });
        }

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const encryptedResponse = encryptData(JSON.stringify(product));
        res.status(200).json({
            success: true,
            data: encryptedResponse,
        });

};


export const updateProduct = async (req, res) => {

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Decrypt and parse the incoming data
    const { data } = req.body;
    const {
      name,
      description,
      brand,
      purchase_price,
      price,
      stock,
      category,
      display_price,
      specifications,
      deletedImageUrls: deleted_images,
      subcategory,
      keywords,
    } = JSON.parse(decryptData(data));

    console.log(
      name,
      description,
      brand,
      purchase_price,
      price,
      stock,
      category,
      display_price,
      specifications,
      deleted_images,
      subcategory,
      keywords
    );

    // Handle new images uploaded
    const newImages = req.files?.new_images || [];
    const mappedNewImages = newImages.map((image) => ({
      url: image.path, // Assuming multer is storing files locally
      alt_text: name,
    }));

    // Get existing images directly from the product in the database
    let existingImages = product.images;

    // Combine existing images with new images
    let updatedImages = [...existingImages, ...mappedNewImages];

    // Handle deletions of old images
    if (deleted_images?.length) {
      deleted_images.forEach(async (url) => {
        const filePath = path.join(__dirname, 'uploads', path.basename(url));
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });

        // Filter out deleted image URLs from the updated image list
        updatedImages = updatedImages.filter((image) => image.url !== url);
      });
    }

    // Calculate stock change and log it to stock history
    const previousStock = product.stock;
    const stockChange = stock - previousStock;

    if (stockChange !== 0) {
      product.stockHistory.push({
        previousStock,
        newStock: stock,
        reason: stockChange > 0 ? 'restock' : 'stock reduction',
        purchase_price,
        date: Date.now(), // Timestamp for the stock change
      });
    }

    // Update product details with the new data
    product.name = name;
    product.description = description;
    product.brand = brand;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.subcategory = subcategory;
    product.display_price = display_price;
    product.images = updatedImages;
    product.specifications = specifications;
    product.keywords = keywords;
    product.updated_at = Date.now();

    // Save the updated product
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
    });

};


  

export const getProductRating = async (req, res) => {
    const product = await Product.findById(req.params.id);
    const ratings = await Review.find({ product: product }, 'rating');
    res.status(200).json({
        success: true,
        data: ratings
    });
}

export const newProduct = async (req, res) => {
    const encryptedData = req.body.data;
    const decryptedData = decryptData(encryptedData);

    const {
      name,
      description,
      purchase_price,
      display_price,
      brand,
      price,
      stock,
      category,
      subcategory,
      specifications,
      keywords
    } = JSON.parse(decryptedData); // Decrypt and parse the data

    const images = req.files;
    const mappedImages = images.map((image) => ({
      url: image.path,
      alt_text: name,
    }));

    // Create the new product with stock history entry
    const newProduct = await Product.create({
      name,
      description,
      display_price,
      price,
      brand,
      stock,
      category,
      subcategory,
      specifications,
      images: mappedImages,
      stockHistory: [
        {
          previousStock: 0, // Since it's a new product, previous stock is 0
          newStock: stock,
          reason: "new", // The reason is "new" since it's a newly created product
          purchase_price: purchase_price,
        },
      ],
      keywords
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      data: newProduct,
    });

};

export const getlatestProducts = async (req, res) => {
    const products = await Product.find().select('-purchase_price -stock -created_at -updated_at').sort({ created_at: -1 }).limit(10);
    const encryptedResponse = encryptData(JSON.stringify(products));
    res.status(200).json({ success: true, data: encryptedResponse });
}



export const getCategories = async (req, res) => {
    const categoriesWithCount = await Product.aggregate([
        {
            $group: {
                _id: "$category",
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                category: "$_id",
                count: 1
            }
        }
    ]);
    res.status(200).json({ success: true, data: categoriesWithCount });
}

export const getProductsByPrice = async (req, res) => {
    const { maxPrice, minPrice } = req.body;
    let query = {};
    if (minPrice !== undefined) {
        query.price = { ...query.price, $gte: minPrice };
    }
    if (maxPrice !== undefined) {
        query.price = { ...query.price, $lte: maxPrice };
    }
    const products = await Product.find(query);
    res.status(200).json({ success: true, data: products });
}

export const getProductsByCategory = async (req, res) => {
    const { category } = req.body;
    const products = await Product.find({ category: category });
    res.status(200).json({ success: true, data: products });
}

export const getAutocompleteSuggestions = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { search } = req.query; // Assuming search term comes from query parameters

    if (!search) {
        return res.status(400).json({ success: false, message: 'Search term is required' });
    }

    try {
        // MongoDB query object
        const query = {
            $or: [
                { name: { $regex: new RegExp(search, 'i') } },
                { category: { $regex: new RegExp(search, 'i') } }
            ]
        };

        // Fetch autocomplete suggestions
        const suggestions = await Product.find(query)
            .limit(10) // Limit the number of suggestions returned
            .distinct('name'); // Return distinct product names for suggestions

        res.status(200).json({
            success: true,
            data: suggestions,
        });
    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch autocomplete suggestions',
        });
    }
};




export const getSimilarProducts = async (req, res) => {

        const { subcategory, category, limit } = req.query;
        let query = {};

        if (subcategory) {
            query.subcategory = decryptData(subcategory);
        } else if (category) {
            query.category = decryptData(category);
        }

        const similarProducts = await Product.find(query).limit(Number(limit));
        const encryptedData = encryptData(JSON.stringify(similarProducts));
        res.json({ data: encryptedData });
    
};
