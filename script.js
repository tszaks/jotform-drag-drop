// script.js
document.addEventListener('DOMContentLoaded', () => {
  const products = document.querySelectorAll('.product');
  const studentsContainer = document.getElementById('studentList');
  let draggedProduct = null;

  // Function to receive student names from URL parameters
  function getStudentNames() {
    const params = new URLSearchParams(window.location.search);
    const studentNames = [];
    for (let i = 1; i <= 5; i++) { // Loop through studentinfo1 to studentinfo5
      const student = params.get(`studentinfo${i}`);
      if (student && student.trim() !== "") {
        studentNames.push(student.trim());
      }
    }
    return studentNames;
  }

  // Populate student names dynamically
  function populateStudents() {
    const studentNames = getStudentNames();
    studentNames.forEach(name => {
      const studentDiv = document.createElement('div');
      studentDiv.classList.add('student');
      studentDiv.setAttribute('data-student', name);
      studentDiv.innerHTML = `
        <strong>${name}</strong>
        <div class="assigned-items" data-assigned="${name}"></div>
      `;
      studentsContainer.appendChild(studentDiv);
    });
  }

  populateStudents();

  // Drag and Drop Events for Products
  products.forEach(product => {
    product.addEventListener('dragstart', (e) => {
      draggedProduct = e.target;
      setTimeout(() => {
        e.target.style.opacity = '0.5';
      }, 0);
    });

    product.addEventListener('dragend', (e) => {
      setTimeout(() => {
        e.target.style.opacity = '1';
        draggedProduct = null;
      }, 0);
    });
  });

  // Drag and Drop Events for Students
  const assignedAreas = document.querySelectorAll('.assigned-items');

  assignedAreas.forEach(area => {
    area.addEventListener('dragover', (e) => {
      e.preventDefault();
      area.style.backgroundColor = '#e1f5fe'; // Highlight drop zone
    });

    area.addEventListener('dragleave', () => {
      area.style.backgroundColor = '#f9f9f9'; // Remove highlight
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.style.backgroundColor = '#f9f9f9'; // Remove highlight
      if (draggedProduct) {
        // Move the dragged product to the assigned-items area
        area.appendChild(draggedProduct);
        draggedProduct.setAttribute('draggable', 'false'); // Disable further dragging
        draggedProduct.style.cursor = 'default'; // Change cursor style
        draggedProduct.classList.remove('product'); // Remove original class
        draggedProduct.classList.add('assigned-product'); // Add new class for styling

        updateAssignments();
      }
    });
  });

  // Function to update assignments
  function updateAssignments() {
    const assignments = {};
    const students = document.querySelectorAll('.student');

    students.forEach(student => {
      const studentName = student.getAttribute('data-student');
      const assignedItems = student.querySelectorAll('.assigned-items .assigned-product');
      assignments[studentName] = [];
      assignedItems.forEach(item => {
        assignments[studentName].push(item.getAttribute('data-product'));
      });
    });

    // Update the hidden input
    document.getElementById('assignments').value = JSON.stringify(assignments);

    // Optionally, send assignments data to parent window
    window.parent.postMessage({ assignments: assignments }, '*');
  }

  // Listen for messages from parent to reset assignments
  window.addEventListener('message', (event) => {
    if (event.data.action === 'reset') {
      location.reload();
    }
  });
});
