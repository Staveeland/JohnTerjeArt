document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
  
    // Fetch products from Firestore collection "products"
    db.collection("products")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const product = doc.data();
          // Create a card for each product
          const card = document.createElement("div");
          card.className = "gallery-item";
          card.innerHTML = `
            <img src="${product.imageURL}" alt="${product.title}">
            <div class="item-info">
              <h3>${product.title}</h3>
            </div>
          `;
          // When clicked, go to the product detail page
          card.addEventListener("click", () => {
            window.location.href = `product.html?id=${doc.id}`;
          });
          gallery.appendChild(card);
        });
      })
      .catch((error) => {
        console.error("Error fetching products: ", error);
      });
  });