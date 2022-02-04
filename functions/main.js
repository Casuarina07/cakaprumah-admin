const config = {
  apiKey: "AIzaSyCEVsUFIsT74A_dTl8UaCMyJmxBMtRDwyY",
  authDomain: "freelance-trial.firebaseapp.com",
  projectId: "freelance-trial",
  storageBucket: "freelance-trial.appspot.com",
  messagingSenderId: "333533410713",
  appId: "1:333533410713:web:0553e41275ed7d78a10f08",
  measurementId: "G-YLPPNTZZTC",
};

firebase.initializeApp(config);

const firestore = firebase.firestore();

//CREATE POST - #2 Youtube Video
const createForm = document.querySelector("#createForm");
const progressBar = document.querySelector("#progressBar");
const progressHandler = document.querySelector("#progressHandler");
const postSubmit = document.querySelector("#postSubmit");

if (createForm != null) {
  let d;
  createForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (
      document.getElementById("title").value != "" &&
      document.getElementById("content").value != "" &&
      document.getElementById("postImage").files[0] != ""
    ) {
      let title = document.getElementById("title").value;
      let content = document.getElementById("content").value;
      let postImage = document.getElementById("postImage").files[0];

      console.log("Title: ", title);
      console.log("Content: ", content);
      console.log("Image: ", postImage);

      //add the image to the storage on firebase
      const storageRef = firebase.storage().ref();
      const storageChild = storageRef.child(postImage.name);
      console.log("Uploading file....");
      const postedCover = storageChild.put(postImage);

      //wait for all the above code to finish and then do the next line of code
      await new Promise((resolve) => {
        postedCover.on(
          "state_changed",
          (snapshot) => {
            let progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(Math.trunc(progress));

            if (progressHandler != null) {
              progressHandler.style.display = true;
            }

            if (postSubmit != null) {
              postSubmit.disabled = true;
            }

            //see the progressBar moving
            if (progressBar != null) {
              progressBar.value = progress;
            }
          },
          (error) => {
            //error
            console.log("Error", error);
          },
          async () => {
            const downloadURL = await storageChild.getDownloadURL();
            d = downloadURL;
            console.log(d);
            resolve();
          }
        );
      });

      const fileRef = await firebase.storage().refFromURL(d);

      let post = {
        title,
        content,
        postImage: d, //https://firebase/image.jpg - where firebase stored the image
        fileref: fileRef._delegate._location.path_, //image.jpg
      };

      await firebase.firestore().collection("posts").add(post);
      console.log("post added successfully");

      if (postSubmit != null) {
        window.location.replace("index.html");
        postSubmit.disabled = false;
      }
    } else {
      console.log("Please fill in all the inputs");
    }
  });
}

//NAVIGATION BAR and RETRIEVING POSTS - #3 Youtube Video

//Check if the DOM is full loaded
document.addEventListener("DOMContentLoaded", (e) => {
  getPosts();
  getPost();
});

const openNav = document.querySelector("#openNav");
const closeNav = document.querySelector("#closeNav");

openNav.addEventListener("click", (e) => {
  document.getElementById("nav").style.width = "250px";
  document.getElementById("main").style.marginLeft = "250px";
});

closeNav.addEventListener("click", (e) => {
  e.preventDefault(); //because closeNav is a link - to prevent it from refreshing need to preventDefault
  document.getElementById("nav").style.width = "0px";
  document.getElementById("main").style.marginLeft = "";
});

const posts = document.querySelector("#posts");

const getPosts = async () => {
  let postsArray = [];
  let docs = await firebase
    .firestore()
    .collection("posts")
    .get()
    .catch((err) => console.log(err));

  docs.forEach((doc) => {
    postsArray.push({ id: doc.id, data: doc.data() });
  });

  createChildren(postsArray);
};

const createChildren = async (arr) => {
  //check if the post element is in the current HTML
  if (posts != null) {
    arr.map((post) => {
      console.log("what is this now: ", post.data.content);

      let div = document.createElement("div");
      let cover = document.createElement("div");
      let anchor = document.createElement("a");
      let anchorNode = document.createTextNode(post.data.title);
      anchor.setAttribute("href", "post.html#/" + post.id);
      anchor.appendChild(anchorNode);
      let content = document.createElement("p");
      content.innerText = post.data.content;

      cover.style.backgroundImage = "url(" + post.data.postImage + ")";
      div.classList.add("post");
      div.appendChild(cover);
      div.appendChild(anchor);
      div.appendChild(content);
      posts.appendChild(div);
    });
  }
};

//INDIVIDUAL POST BY ID - post.html #4 Youtube Video
const loading = document.querySelector("#loading");
const loader = document.querySelector(".lds-ring");
const deleteButton = document.querySelector("#delete");
const editButton = document.querySelector("#edit");
const singlePost = document.querySelector("#singlePost");

const getPost = async () => {
  let postID = getPostIDFromURL();

  //if loading element exist in the current HTML document
  if (loading != null) {
    // loading.style.display = "block";
    loader.style.display = "inline-block";
  }

  let post = await firebase
    .firestore()
    .collection("posts")
    .doc(postID)
    .get()
    .catch((err) => console.log(err));

  if (loading != null) {
    loading.style.display = "none";
    loader.style.display = "none";
  }

  if (post != null && deleteButton != null) {
    deleteButton.style.display = "block";
  }

  if (post != null && editButton != null) {
    editButton.style.display = "block";
  }

  createChild(post.data());
};

const getPostIDFromURL = () => {
  let postLocation = window.location.href; //the whole link
  let hrefArray = postLocation.split("/");
  console.log("hrefArray: ", hrefArray);
  let postID = hrefArray.slice(-1).pop(); //last value
  console.log("postID: ", postID);

  return postID;
};

const createChild = (postData) => {
  if (singlePost != null) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.setAttribute("src", postData.postImage);
    img.setAttribute("loading", "lazy");

    let title = document.createElement("h3");
    let titleNode = document.createTextNode(postData.title);
    title.appendChild(titleNode);

    let content = document.createElement("div");
    let contentNode = document.createTextNode(postData.content);
    content.appendChild(contentNode);

    div.appendChild(img);
    div.appendChild(title);
    div.appendChild(content);

    singlePost.appendChild(div);
  }
};
