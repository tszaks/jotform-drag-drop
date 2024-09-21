// script.js
document.addEventListener('DOMContentLoaded', () => {
  const products = document.querySelectorAll('.product');
  const studentsContainer = document.getElementById('studentList');
  let draggedProduct = null;

  // Function to receive student names from URL parameters
  function getStudentNames() {
    const params = new URLSearchParams(window.location.search);
    const students = params.get('students'); // Expecting a comma-separated list
    return students ? students.split(',') : [];
  }

  // Populate student names dynamically
  function populateStudents() {
    const studentNames = getStudentNames();
    studentNames.forEach(name => {
      const trimmedName = name.trim();
      if(trimmedName) { // Ensure no empty names
        const studentDiv = document.createElement('div');
        studentDiv.classList.add('student');
        studentDiv.setAttribute('data-student', trimmedName);
        studentDiv.innerHTML = `
          <strong>${trimmedName}</strong>
          <div class="assigned-items" data-assigned="${trimmedName}"></div>
        `;
        studentsContainer.appendChild(studentDiv);
      }
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
      area.style.backgroundColor = '#e1f5fe';
    });

    area.addEventListener('dragleave', () => {
      area.style.backgroundColor = '#f9f9f9';
    });

    area.addEventListener('drop', (e) => {
      e.preventDefault();
      area.style.backgroundColor = '#f9f9f9';
      if (draggedProduct) {
        // Clone the dragged product to assign it
        const clonedProduct = draggedProduct.cloneNode(true);
        clonedProduct.setAttribute('draggable', 'false');
        clonedProduct.style.cursor = 'default';
        clonedProduct.classList.remove('product');
        clonedProduct.classList.add('assigned-product');
        area.appendChild(clonedProduct);

        // Optionally, remove the product from the cart
        // draggedProduct.parentNode.removeChild(draggedProduct);

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

    // Send assignments data to parent window
    window.parent.postMessage({ assignments: assignments }, '*');
  }

  // Listen for messages from parent to reset assignments
  window.addEventListener('message', (event) => {
    if (event.data.action === 'reset') {
      location.reload();
    }
  });
});
