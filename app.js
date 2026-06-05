const button = document.getElementById('greetButton');
const message = document.getElementById('message');

button.addEventListener('click', () => {
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : 'afternoon';
  message.textContent = `You are ready to learn GitHub and Codex this ${timeOfDay}.`; 
});
