import express from 'express';
import { deleteProduct,
    updateProduct,
    getProductDetails,
    getProducts,
    newProduct, 
    createProductReview,
    getProductReviews,
    deleteReview,getAdminProducts,uploadProductImages,deleteProductImage} from '../controllers/productControllers.js';
import { authorizeRoles, isAuthentictedUser } from '../middlewares/authh.js';
const router = express.Router();

router.route("/products").get(getProducts);
router.route("/admin/products").post(isAuthentictedUser,authorizeRoles('admin'),newProduct)
.get(isAuthentictedUser, authorizeRoles("admin"), getAdminProducts);

router.route("/products/:id").get(getProductDetails);


router
  .route("/admin/products/:id/upload_images")
  .put(isAuthentictedUser, authorizeRoles("admin"), uploadProductImages);

  router
  .route("/admin/products/:id/delete_image")
  .put(isAuthentictedUser, authorizeRoles("admin"), deleteProductImage);




router.route("/admin/products/:id").put(isAuthentictedUser,authorizeRoles('admin'),updateProduct);
router.route("/admin/products/:id").delete(isAuthentictedUser,authorizeRoles('admin'),deleteProduct);
router.route("/reviews")
.get(isAuthentictedUser,getProductReviews)
.put(isAuthentictedUser,createProductReview);


router.route("/admin/reviews").delete(isAuthentictedUser,authorizeRoles('admin'),deleteReview)
// router.route("/can_review").get(isAuthentictedUser,canUserReview);

export default router;






