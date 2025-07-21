import { z } from 'zod';

// Schema for a single item in the cart
const cartItemSchema = z.object({
  productId: z.string().min(1, "Product ID cannot be empty."),
  quantity: z.number().int().min(1, "Quantity must be at least 1."),
});

// Schema for the shipping information
const shippingInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zipCode: z.string().min(1, "ZIP code is required."),
  country: z.string().min(1, "Country is required."),
});

// Schema for the `/api/create-order` endpoint
export const createOrderSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, "Cart cannot be empty."),
  shippingInfo: shippingInfoSchema,
  paymentMethod: z.string().min(1, "Payment method is required."),
  userId: z.string().optional(),
});

// Schema for the `/api/initiate-payment` endpoint
export const initiatePaymentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required."),
  paymentMethod: z.string().min(1, "Payment method is required."),
});