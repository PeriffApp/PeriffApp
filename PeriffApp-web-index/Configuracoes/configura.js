// Alterna a classe dark-mode no body ao clicar no checkbox
document.addEventListener('DOMContentLoaded', function() {
  const checkbox = document.getElementById('dark-mode');
  // Mantém o estado ao recarregar a página
  if (localStorage.getItem('dark-mode') === 'true') {
      document.body.classList.add('dark-mode');
      checkbox.checked = true;
  }
  checkbox.addEventListener('change', function() {
      if (checkbox.checked) {
          document.body.classList.add('dark-mode');
          localStorage.setItem('dark-mode', 'true');
      } else {
          document.body.classList.remove('dark-mode');
          localStorage.setItem('dark-mode', 'false');
      }
  });
});