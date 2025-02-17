document.addEventListener("DOMContentLoaded", function () {
    const productContainer = document.getElementById("product-container");
  
    // Helper to get query parameter from URL
    function getQueryParam(param) {
      let params = new URLSearchParams(window.location.search);
      return params.get(param);
    }
  
    const productId = getQueryParam("id");
    if (!productId) {
      productContainer.innerHTML = "<p>Product not found.</p>";
      return;
    }
  
    // Fetch product details from Firestore
    db.collection("products")
      .doc(productId)
      .get()
      .then((doc) => {
        if (doc.exists) {
          const product = doc.data();
          productContainer.innerHTML = `
            <div class="product-image">
              <img src="${product.imageURL}" alt="${product.title}">
            </div>
            <div class="product-info">
              <h1>${product.title}</h1>
              <p>${product.description}</p>
              <p class="price">Price: ${product.price} NOK</p>
              <p class="reference">Reference Number: ${product.reference}</p>
              <div class="purchase-options">
                <button id="buyRequest">Send Purchase Request</button>
                <button id="buyNow">Buy Now with Vipps</button>
              </div>
              <div id="instructions" class="instructions"></div>
            </div>
          `;
  
          // Buy Now button: show Vipps instructions
          document.getElementById("buyNow").addEventListener("click", function () {
            const instructionsDiv = document.getElementById("instructions");
            instructionsDiv.innerHTML = `<p>To purchase, please send a Vipps payment of ${product.price} NOK with the reference number <strong>${product.reference}</strong>. We will contact you regarding delivery options.</p>`;
          });
  
          // Purchase Request button: open email client
          document.getElementById("buyRequest").addEventListener("click", function () {
            window.location.href = `mailto:contact@stavelandart.com?subject=Purchase Request for ${product.title}&body=I would like to purchase the artwork titled "${product.title}" (Reference: ${product.reference}).`;
          });
        } else {
          productContainer.innerHTML = "<p>Product not found.</p>";
        }
      })
      .catch((error) => {
        console.error("Error fetching product: ", error);
        productContainer.innerHTML = "<p>Error loading product details.</p>";
      });
  });