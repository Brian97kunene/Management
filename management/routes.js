import { Router } from "express";
import {
    getAll,
    getAllSuppliers,
    getOne,
    getByFilter,
    create,
    update,
    remove
} from "./controller.js";

const router = Router();

router.get("/getAllProducts", getAll);
router.get("/getAllsuppliers", getAllSuppliers);
router.get("/:id", getOne);
router.get("/sku/:sku", getByFilter);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", remove);

export default router;