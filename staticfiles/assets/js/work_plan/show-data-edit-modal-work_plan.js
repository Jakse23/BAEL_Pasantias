$(document).ready(function () {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document.getElementById("edit-id").value = this.dataset.id;
      document.getElementById("edit-name").value = this.dataset.name;
      document.getElementById("edit-system").value = this.dataset.system;
      new bootstrap.Modal(document.getElementById("editModal")).show();
    });
  });
});