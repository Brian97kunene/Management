import { Product } from "./src/ProductModel.js";
import {Supplier} from "./src/SupplierModel.js";





// GET all Suppliers
export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json(suppliers);
    } catch ({ message }) {
        res.status(500).json({ message });
    }
};



// POST create
export const createSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(201).json(supplier);
    } catch ({ message }) {
        res.status(400).json({ message });
    }
};







// ALL PRODUCT ENDPOINTS
// ALL PRODUCT ENDPOINTS
// ALL PRODUCT ENDPOINTS                               

export const getAll = async (req, res) => {
    try {
        const Products = await Product.find().skip(990).limit(150);
        res.json(Products);
    } catch ({ message }) {
        res.status(500).json({ message });
    }
};

// GET one
export const getOne = async (req, res) => {
    try {
        const Product = await Product.findById(req.params.id);
        if (!Product) return res.status(404).json({ message: "Product not found" });
        res.json(Product);
    } catch ({ message }) {
        res.status(500).json({ message });
    }
};
// GET BY SUPPLIER
export const getByFilter = async (req, res) => {
    try {

        

        console.log(req.params.sku);


        const product = await Product.find({ name: { $regex : req.params.sku ,$options:"i"} });
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.json(product);
    } catch ({ message }) {
        res.status(500).json({ message });
    }
};

// POST create
export const create = async (req, res) => {
    try {
        const Product = await Product.create(req.body);
        res.status(201).json(Product);
    } catch ({ message }) {
        res.status(400).json({ message });
    }
};

// PUT update
export const update = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: "Product not found" });
        res.json(updated);
    } catch ({ message }) {
        res.status(400).json({ message });
    }
};

// DELETE
export const remove = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Product not found" });
        res.json({ message: "Product deleted successfully" });
    } catch ({ message }) {
        res.status(500).json({ message });
    }
};