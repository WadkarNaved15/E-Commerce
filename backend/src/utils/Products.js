import Product from "../models/Product.js";
import Review from "../models/Review.js";
import { validationResult } from "express-validator";
import { getSynonyms, getCategoryMappings } from "../middlewares/Functions.js"; 
import fs from 'fs';
import path from 'path';
import { decryptData , encryptData } from "./Encryption.js";



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
    
        // Sanitize each search term
        searchTerms = searchTerms.flatMap(term => getSynonyms(term).map(escapeRegex));
    
        let categoryMappings = getCategoryMappings(searchTerms);
    
        categoryMappings = [...new Set(categoryMappings)];
    
        // Build the regex safely
        regexSearch = new RegExp(searchTerms.map(term => `\\b${term}\\b`).join('|'), 'i');
    
        query.$or = [
            { name: { $regex: regexSearch.source, $options: 'i' } },
            { category: { $regex: regexSearch.source, $options: 'i' } },
            { subcategory: { $regex: regexSearch.source, $options: 'i' } },
            {
                specifications: {
                    $elemMatch: {
                        key: { $regex: regexSearch.source, $options: 'i' },
                        value: { $regex: regexSearch.source, $options: 'i' }
                    }
                }
            },
            ...categoryMappings.map(cat => ({ category: { $regex: `^${escapeRegex(cat)}$`, $options: 'i' } }))
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
                        matchCount: {
                            $sum: [
                                { $cond: [{ $regexMatch: { input: "$name", regex: regexSearch } }, 1, 0] },
                                { $cond: [{ $regexMatch: { input: "$category", regex: regexSearch } }, 1, 0] },
                                { $cond: [{ $regexMatch: { input: "$subcategory", regex: regexSearch } }, 1, 0] },
                                {
                                    $sum: {
                                        $map: {
                                            input: "$specifications",
                                            as: "spec",
                                            in: {
                                                $cond: [
                                                    { $or: [
                                                        { $regexMatch: { input: "$$spec.key", regex: regexSearch } },
                                                        { $regexMatch: { input: "$$spec.value", regex: regexSearch } }
                                                    ] },
                                                    1,
                                                    0
                                                ]
                                            }
                                        }
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        matchCount: -1,
                        price: sort === "asc" ? 1 : -1
                    }
                }
            ];            
        }

        pipeline.push({ $skip: (page - 1) * perPage });
        pipeline.push({ $limit: perPage });

        const results = await Product.aggregate(pipeline)
            .collation({ locale: "en", strength: 2 }) // Apply collation here
            .exec();

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
            message: 'Failed to fetch products',
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
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      brand,
      purchase_price,
      price,
      stock,
      category,
      display_price,
      edited_image_index,
      deleted_images,
    } = req.body;

    // Handle new images
    const newImages = req.files?.new_images || [];
    const mappedNewImages = newImages.map(image => ({
      url: image.path,
      alt_text: name
    }));

    const existingImages = JSON.parse(req.body.existing_images || '[]');

    // Handle existing images and edited image
    const updatedImages = existingImages.map((url, i) => {
      if (i === edited_image_index) {
        // Insert edited image
        return { url: mappedNewImages.length ? mappedNewImages.shift().url : url, alt_text: name };
      } else if (i > edited_image_index) {
        // Move existing images one index further
        return { url, alt_text: name };
      }
      return { url, alt_text: name };
    });

    // Append remaining new images
    updatedImages.push(...mappedNewImages);

    // Calculate stock change and log to stock history
    const previousStock = product.stock;
    const stockChange = stock - previousStock;

    if (stockChange !== 0) {

      product.stockHistory.push({
        previousStock,
        newStock: stock,
        reason: "restock",
        purchase_price
      });
    }

    // Update product details
    product.name = name;
    product.description = description;
    product.brand = brand;
    product.price = price;
    product.stock = stock;
    product.category = category;
    product.display_price = display_price;
    product.images = updatedImages;
    product.updated_at = Date.now();

    // Save updated product
    await product.save();

    // Handle deletions of old images
    deleted_images?.forEach(async (url) => {
      const filePath = path.join(__dirname, '../uploads', path.basename(url)); // Adjust path as needed
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
    });
  }
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
