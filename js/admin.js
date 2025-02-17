document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const adminDashboard = document.getElementById("admin-dashboard");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const loginError = document.getElementById("login-error");
  
    const submitArtBtn = document.getElementById("submit-art-btn");
    const submitArtMessage = document.getElementById("submit-art-message");
  
    const artTitleInput = document.getElementById("art-title");
    const artDescriptionInput = document.getElementById("art-description");
    const artImageInput = document.getElementById("art-imageFile");
    const artPriceInput = document.getElementById("art-price");
    const artReferenceInput = document.getElementById("art-reference");
    const artGroupSelect = document.getElementById("art-group");
    const formTitle = document.getElementById("form-title");
  
    const artworksListDiv = document.getElementById("artworks-list");
  
    let editMode = false;
    let editingArtId = null;
  
    // Login event
    loginBtn.addEventListener("click", function () {
      const email = document.getElementById("admin-email").value;
      const password = document.getElementById("admin-password").value;
  
      firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
          loginForm.style.display = "none";
          adminDashboard.classList.remove("hidden");
          loadArtworks();
        })
        .catch((error) => {
          loginError.textContent = error.message;
        });
    });
  
    // Logout event
    logoutBtn.addEventListener("click", function () {
      firebase.auth().signOut().then(() => {
        adminDashboard.classList.add("hidden");
        loginForm.style.display = "flex";
      }).catch((error) => {
        console.error("Error during sign out:", error);
      });
    });
  
    // Load artworks from Firestore and display them
    function loadArtworks() {
      artworksListDiv.innerHTML = "";
      db.collection("products").get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const product = doc.data();
            const artDiv = document.createElement("div");
            artDiv.className = "art-item";
            artDiv.innerHTML = `
              <img src="${product.imageURL}" alt="${product.title}" class="art-thumb">
              <div class="art-details">
                <h4>${product.title}</h4>
                <p>${product.description}</p>
                <p><strong>Price:</strong> ${product.price} NOK</p>
                <p><strong>Reference:</strong> ${product.reference}</p>
                <p><strong>Category:</strong> ${product.group || "N/A"}</p>
                <div class="art-actions">
                  <button class="edit-btn" data-id="${doc.id}">Edit</button>
                  <button class="delete-btn" data-id="${doc.id}">Delete</button>
                </div>
              </div>
            `;
            artworksListDiv.appendChild(artDiv);
          });
          // Attach event listeners for edit and delete buttons
          document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", handleEdit);
          });
          document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", handleDelete);
          });
        })
        .catch((error) => {
          console.error("Error loading artworks:", error);
        });
    }
  
    // Delete artwork
    function handleDelete(e) {
      const artId = e.target.getAttribute("data-id");
      if (confirm("Are you sure you want to delete this artwork?")) {
        db.collection("products").doc(artId).delete()
          .then(() => {
            loadArtworks();
          })
          .catch((error) => {
            console.error("Error deleting artwork:", error);
          });
      }
    }
  
    // Edit artwork: populate the form with artwork data
    function handleEdit(e) {
      const artId = e.target.getAttribute("data-id");
      db.collection("products").doc(artId).get()
        .then((doc) => {
          if (doc.exists) {
            const product = doc.data();
            artTitleInput.value = product.title;
            artDescriptionInput.value = product.description;
            artPriceInput.value = product.price;
            artReferenceInput.value = product.reference;
            artGroupSelect.value = product.group || "";
            formTitle.textContent = "Edit Artwork";
            submitArtBtn.textContent = "Update Artwork";
            editMode = true;
            editingArtId = artId;
          }
        })
        .catch((error) => {
          console.error("Error fetching artwork for edit:", error);
        });
    }
  
    // Handle add/update artwork action
    submitArtBtn.addEventListener("click", function () {
      const title = artTitleInput.value;
      const description = artDescriptionInput.value;
      const price = artPriceInput.value;
      const reference = artReferenceInput.value;
      const group = artGroupSelect.value;
      const file = artImageInput.files[0];
  
      if (!title || !description || !price || !reference || !group) {
        submitArtMessage.textContent = "Please fill in all fields and select a category.";
        return;
      }
  
      if (editMode) {
        // Update artwork; if a new image is provided, upload it first
        if (file) {
          const fileName = `${Date.now()}_${file.name}`;
          const storageRef = firebase.storage().ref(`artworks/${fileName}`);
          const uploadTask = storageRef.put(file);
          uploadTask.on("state_changed",
            () => {},
            (error) => {
              submitArtMessage.textContent = "Image upload failed: " + error.message;
            },
            () => {
              uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                db.collection("products").doc(editingArtId).update({
                  title,
                  description,
                  imageURL: downloadURL,
                  price,
                  reference,
                  group
                })
                .then(() => {
                  submitArtMessage.textContent = "Artwork updated successfully!";
                  resetForm();
                  loadArtworks();
                })
                .catch((error) => {
                  submitArtMessage.textContent = "Error updating artwork: " + error.message;
                });
              });
            }
          );
        } else {
          // Update without a new image
          db.collection("products").doc(editingArtId).update({
            title,
            description,
            price,
            reference,
            group
          })
          .then(() => {
            submitArtMessage.textContent = "Artwork updated successfully!";
            resetForm();
            loadArtworks();
          })
          .catch((error) => {
            submitArtMessage.textContent = "Error updating artwork: " + error.message;
          });
        }
      } else {
        // Add new artwork; image file is required
        if (!file) {
          submitArtMessage.textContent = "Please select an image file.";
          return;
        }
        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = firebase.storage().ref(`artworks/${fileName}`);
        const uploadTask = storageRef.put(file);
        uploadTask.on("state_changed",
          () => {},
          (error) => {
            submitArtMessage.textContent = "Image upload failed: " + error.message;
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
              db.collection("products").add({
                title,
                description,
                imageURL: downloadURL,
                price,
                reference,
                group
              })
              .then(() => {
                submitArtMessage.textContent = "Artwork added successfully!";
                resetForm();
                loadArtworks();
              })
              .catch((error) => {
                submitArtMessage.textContent = "Error adding artwork: " + error.message;
              });
            });
          }
        );
      }
    });
  
    // Reset form to default "Add" mode
    function resetForm() {
      artTitleInput.value = "";
      artDescriptionInput.value = "";
      artImageInput.value = "";
      artPriceInput.value = "";
      artReferenceInput.value = "";
      artGroupSelect.value = "";
      formTitle.textContent = "Add New Artwork";
      submitArtBtn.textContent = "Add Artwork";
      editMode = false;
      editingArtId = null;
    }
  
    // Check authentication state on page load
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        loginForm.style.display = "none";
        adminDashboard.classList.remove("hidden");
        loadArtworks();
      } else {
        adminDashboard.classList.add("hidden");
        loginForm.style.display = "flex";
      }
    });
  });