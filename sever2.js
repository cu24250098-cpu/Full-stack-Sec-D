import React, { useState } from "react";

export default function App() {
  const products = [
    { id: 1, name: "Laptop", price: 50000 },
    { id: 2, name: "Headphones", price: 800 },
    { id: 3, name: "Keyboard", price: 600 },
    { id: 4, name: "Mouse", price: 400 },
  ];

  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);

      if (found) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // Change quantity
  const changeQuantity = (id, amount) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove product
  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculate totals
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discount = subtotal >= 1000 ? subtotal * 0.1 : 0;
  const total = subtotal - discount;

  const money = (amount) => `₹${amount.toFixed(2)}`;

  return (
    <div style={{
      maxWidth: "650px",
      margin: "30px auto",
      padding: "20px",
      fontFamily: "Arial",
      border: "1px solid #ddd",
      borderRadius: "12px"
    }}>
      <h1>Shopping Cart</h1>

      <h2>Available Products</h2>

      {products.map((product) => (
        <div key={product.id} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "12px"
        }}>
          <span>
            {product.name} - {money(product.price)}
          </span>

          <button onClick={() => addToCart(product)}>
            Add to Cart
          </button>
        </div>
      ))}

      <hr />

      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        cart.map((item) => (
          <div key={item.id} style={{
            padding: "12px 0",
            borderBottom: "1px solid #eee"
          }}>
            <strong>{item.name}</strong>
            <p>
              {money(item.price)} × {item.quantity} ={" "}
              {money(item.price * item.quantity)}
            </p>

            <button onClick={() => changeQuantity(item.id, -1)}>
              -
            </button>

            <span style={{ margin: "0 12px" }}>
              {item.quantity}
            </span>

            <button onClick={() => changeQuantity(item.id, 1)}>
              +
            </button>

            <button
              onClick={() => removeItem(item.id)}
              style={{ marginLeft: "12px" }}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <hr />

      <h2>Order Summary</h2>
      <p>Subtotal: {money(subtotal)}</p>
      <p>Discount: -{money(discount)}</p>
      <h2>Final Total: {money(total)}</h2>

      {discount > 0 && (
        <p style={{ color: "green" }}>
          Congratulations! You received a 10% discount.
        </p>
      )}
    </div>
  );
}