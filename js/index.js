document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("gallery");
  
    // Fetch products from Firestore collection "products"
    db.collection("products")
      .get()
      .then((querySnapshot) => {
        // Group products by their 'group' field
        let groups = {};
        querySnapshot.forEach((doc) => {
          const product = doc.data();
          product.id = doc.id;
          const groupName = product.group ? product.group : "uncategorized";
          if (!groups[groupName]) {
            groups[groupName] = [];
          }
          groups[groupName].push(product);
        });
  
        // For each group, create a header and a grid container
        for (const group in groups) {
          // Create and append group header
          const groupHeader = document.createElement("h2");
          // Capitalize first letter
          groupHeader.textContent = group.charAt(0).toUpperCase() + group.slice(1);
          gallery.appendChild(groupHeader);
  
          // Create a container for artworks in this group
          const groupContainer = document.createElement("div");
          groupContainer.className = "gallery-grid-group";
          groups[group].forEach((product) => {
            const card = document.createElement("div");
            card.className = "gallery-item";
            card.innerHTML = `
              <img src="${product.imageURL}" alt="${product.title}">
              <div class="item-info">
                <h3>${product.title}</h3>
              </div>
            `;
            // When clicked, redirect to product detail page
            card.addEventListener("click", () => {
              window.location.href = `product.html?id=${product.id}`;
            });
            groupContainer.appendChild(card);
          });
          gallery.appendChild(groupContainer);
        }
      })
      .catch((error) => {
        console.error("Error fetching products: ", error);
      });
  });