 // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
  import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,signInWithPopup,GoogleAuthProvider,
  } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"
  import {
    getFirestore, collection, doc, setDoc, addDoc,
    updateDoc,deleteDoc,
    serverTimestamp,
    onSnapshot,
    query,
    where,
    orderBy,
  } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"
  
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
   const firebaseConfig = {
    apiKey: "AIzaSyCJPcqH4CUO6xG1eG-54L6ct6Ux75Va8Lc",
    authDomain: "system-managment-3414f.firebaseapp.com",
    projectId: "system-managment-3414f",
    storageBucket: "system-managment-3414f.firebasestorage.app",
    messagingSenderId: "357272377390",
    appId: "1:357272377390:web:1005f34a26dad97db527bf",
    measurementId: "G-BYY0P3YFDF"
  };
 // Initialize Firebase
  const app = initializeApp(firebaseConfig)
  const analytics = getAnalytics(app);
const auth = getAuth(app)
const db = getFirestore(app)
const provider = new GoogleAuthProvider();
const firebase = {
  firestore: {
    FieldValue: {
      serverTimestamp: serverTimestamp,
    },
  },
}
const authModal = document.getElementById("auth-modal")
const taskModal = document.getElementById("task-modal")
const loginBtn = document.getElementById("login-btn")
const registerBtn = document.getElementById("register-btn")
const logoutBtn = document.getElementById("logout-btn")
const authForm = document.getElementById("auth-form")
const taskForm = document.getElementById("task-form")
const addTaskBtn = document.getElementById("add-task-btn")
const modalTitle = document.getElementById("modal-title")
const authSubmitBtn = document.getElementById("auth-submit-btn")
const taskModalTitle = document.getElementById("task-modal-title")
const taskSubmitBtn = document.getElementById("task-submit-btn")
const userEmail = document.getElementById("user-email")
const loggedOutView = document.getElementById("logged-out-view")
const loggedInView = document.getElementById("logged-in-view")
const appMain = document.getElementById("app-main")
const closeModalBtns = document.querySelectorAll(".close-modal")
const todoTasksList = document.getElementById("todo-tasks")
const progressTasksList = document.getElementById("progress-tasks")
const doneTasksList = document.getElementById("done-tasks")
const heroSection = document.querySelector(".hero");

let currentUser = null
let currentTaskId = null
let isEditing = false

loginBtn.addEventListener("click", () => showAuthModal("login"))
registerBtn.addEventListener("click", () => showAuthModal("register"))
logoutBtn.addEventListener("click", logoutUser)
authForm.addEventListener("submit", handleAuthSubmit)
taskForm.addEventListener("submit", handleTaskSubmit)
addTaskBtn.addEventListener("click", () => showTaskModal())

closeModalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    authModal.classList.add("hidden")
    taskModal.classList.add("hidden")
  })
})
auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user
      userEmail.textContent = user.email
      loggedOutView.classList.add("hidden")
      loggedInView.classList.remove("hidden")
      appMain.classList.remove("hidden")
      loggedInView.classList.add("fade-in");
      heroSection.classList.add("hidden");
      loadTasks()
    } else {
      currentUser = null
      loggedOutView.classList.remove("hidden")
      loggedInView.classList.add("hidden")
      appMain.classList.add("hidden")
     heroSection.classList.remove("hidden"); 
    }
  })
  
  // Auth Functions
  function showAuthModal(type) {
    modalTitle.textContent = type === "login" ? "Login" : "Register"
    authSubmitBtn.textContent = type === "login" ? "Login" : "Register"
    authForm.dataset.type = type
    authModal.classList.remove("hidden")
  }
  
  function handleAuthSubmit(e) {
    e.preventDefault()
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const type = authForm.dataset.type
  
    if (type === "login") {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          authModal.classList.add("hidden")
          authForm.reset()
        })
        .catch((error) => alert(error.message))
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Save user info to Firestore
          return setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          })
        })
        .then(() => {
          authModal.classList.add("hidden")
          authForm.reset()
        })
        .catch((error) => alert(error.message))
    }
  }
  document.getElementById("google-btn")?.addEventListener("click", (e) => {
    e.preventDefault();
    signInWithPopup(auth, provider)
.then(() => {
    alert("Login Successful!");
    // window.location.href = "welcome.html";
})
.catch((error) => {
    alert(error.message);
});
});
  function logoutUser() {
    signOut(auth).catch((error) => alert(error.message))
  }
  
  // Task Functions
  function showTaskModal(task = null) {
    const taskTitle = document.getElementById("task-title")
    const taskDescription = document.getElementById("task-description")
    const taskAssignee = document.getElementById("task-assignee")
    const taskIdInput = document.getElementById("task-id")
    const taskStatusInput = document.getElementById("task-status")
  
    if (task) {
      // Edit mode
      taskModalTitle.textContent = "Edit Task"
      taskSubmitBtn.textContent = "Update Task"
      taskTitle.value = task.title
      taskDescription.value = task.description
      taskAssignee.value = task.assignee
      taskIdInput.value = task.id
      taskStatusInput.value = task.status
      isEditing = true
      currentTaskId = task.id
    } else {
      // Add mode
      taskModalTitle.textContent = "Add New Task"
      taskSubmitBtn.textContent = "Add Task"
      taskForm.reset()
      taskIdInput.value = ""
      taskStatusInput.value = "todo"
      isEditing = false
      currentTaskId = null
    }
  
    taskModal.classList.remove("hidden")
  }
  
  function handleTaskSubmit(e) {
    e.preventDefault()
  
    const taskData = {
      title: document.getElementById("task-title").value,
      description: document.getElementById("task-description").value,
      assignee: document.getElementById("task-assignee").value,
      status: document.getElementById("task-status").value,
      userId: currentUser.uid,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }
  
    if (isEditing && currentTaskId) {
      // Update existing task
      updateDoc(doc(db, "tasks", currentTaskId), taskData)
        .then(() => {
          taskModal.classList.add("hidden")
          taskForm.reset()
        })
        .catch((error) => alert(error.message))
    } else {
      // Add new task
      taskData.createdAt = firebase.firestore.FieldValue.serverTimestamp()
  
      addDoc(collection(db, "tasks"), taskData)
        .then(() => {
          taskModal.classList.add("hidden")
          taskForm.reset()
        })
        .catch((error) => alert(error.message))
    }
    taskForm.reset();

  }


  function loadTasks() {
    // Clear existing tasks
    todoTasksList.innerHTML = ""
    progressTasksList.innerHTML = ""
    doneTasksList.innerHTML = ""
  
    // Get tasks from Firestore
    const tasksQuery = query(
      collection(db, "tasks"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    )
  
    onSnapshot(tasksQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const task = {
          id: change.doc.id,
          ...change.doc.data(),
        }
  
        if (change.type === "added") {
          renderTask(task)
        } else if (change.type === "modified") {
          // Remove old version and add updated version
          const existingTask = document.getElementById(`task-${task.id}`)
          if (existingTask) {
            existingTask.remove()
          }
          renderTask(task)
        } else if (change.type === "removed") {
          const taskElement = document.getElementById(`task-${task.id}`)
          if (taskElement) {
            taskElement.remove()
          }
        }
      })
    })
  }
  
  function renderTask(task) {
    const taskElement = document.createElement("div")
    taskElement.className = "task-card"
    taskElement.id = `task-${task.id}`
    taskElement.draggable = true
  
    taskElement.innerHTML = `
          <h1>${task.title}</h1>
          <p>${task.description}</p>
          <div class="task-assignee">${task.assignee}</div>
          <div class="task-actions">
              <button class="task-btn edit-btn" data-id="${task.id}">Edit</button>
              <button class="task-btn delete-btn" data-id="${task.id}">Delete</button>
              ${getMovementButtons(task.status, task.id)}
          </div>
      `
  
    // Add event listeners
    taskElement.querySelector(".edit-btn").addEventListener("click", () => editTask(task))
    taskElement.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id))
  
    const moveButtons = taskElement.querySelectorAll(".move-btn")
    moveButtons.forEach((btn) => {
      btn.addEventListener("click", () => moveTask(task.id, btn.dataset.status))
    })
  
    // Add drag events
    taskElement.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", task.id)
      setTimeout(() => {
        taskElement.classList.add("dragging")
      }, 0)
    })
  
    taskElement.addEventListener("dragend", () => {
      taskElement.classList.remove("dragging")
    })
  
    // Add to appropriate column
    if (task.status === "todo") {
      todoTasksList.appendChild(taskElement)
    } else if (task.status === "progress") {
      progressTasksList.appendChild(taskElement)
    } else if (task.status === "done") {
      doneTasksList.appendChild(taskElement)
    }
  }
  
  function getMovementButtons(status, taskId) {
    if (status === "todo") {
      return `<button class="task-btn move-btn" data-id="${taskId}" data-status="progress">Move to Progress</button>`
    } else if (status === "progress") {
      return `
              <button class="task-btn move-btn" data-id="${taskId}" data-status="todo">Move to Todo</button>
              <button class="task-btn move-btn" data-id="${taskId}" data-status="done">Move to Done</button>
          `
    } else if (status === "done") {
      return `<button class="task-btn move-btn" data-id="${taskId}" data-status="progress">Move to Progress</button>`
    }
    return ""
  }
  
  function editTask(task) {
    showTaskModal(task)
  }
  
  function deleteTask(taskId) {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteDoc(doc(db, "tasks", taskId)).catch((error) => alert(error.message))
    }
  }
  
  function moveTask(taskId, newStatus) {
    updateDoc(doc(db, "tasks", taskId), {
      status: newStatus,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch((error) => alert(error.message))
  }
  
  // Setup drag and drop
  function setupDragAndDrop() {
    const columns = document.querySelectorAll(".task-list")
  
    columns.forEach((column) => {
      column.addEventListener("dragover", (e) => {
        e.preventDefault()
        const afterElement = getDragAfterElement(column, e.clientY)
        const draggable = document.querySelector(".dragging")
  
        if (afterElement == null) {
          column.appendChild(draggable)
        } else {
          column.insertBefore(draggable, afterElement)
        }
      })
  
      column.addEventListener("drop", (e) => {
        e.preventDefault()
        const taskId = e.dataTransfer.getData("text/plain")
        let newStatus
  
        if (column.id === "todo-tasks") {
          newStatus = "todo"
        } else if (column.id === "progress-tasks") {
          newStatus = "progress"
        } else if (column.id === "done-tasks") {
          newStatus = "done"
        }
  
        if (newStatus) {
          moveTask(taskId, newStatus)
        }
      })
    })
  }
  
  function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task-card:not(.dragging)")]
  
    return draggableElements.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2
  
        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child }
        } else {
          return closest
        }
      },
      { offset: Number.NEGATIVE_INFINITY },
    ).element
  }
  
  // Initialize drag and drop
  setupDragAndDrop()
  // (Add this after you initialize Firestore:)
import { enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Enable Firestore offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.error('Persistence failed because multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    console.error('Persistence is not available.');
  }
});
