document.querySelector('.forgot-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const identifier = document.getElementById('forgot-identifier').value.trim();
  const users = JSON.parse(localStorage.getItem('users')) || [];
  // Find by username OR email
  const user = users.find(u => u.username === identifier || u.email === identifier);
  const msg = document.getElementById('forgot-message');
  if (!user) {
    msg.textContent = "No account found with this username or email.";
    msg.style.color = "red";
    return;
  }
  msg.innerHTML = `
    <form id="reset-form">
      <label for="new-pass">New Password</label>
      <input type="password" id="new-pass" required>
      <button type="submit">Reset Password</button>
    </form>
  `;
  document.getElementById('reset-form').onsubmit = function(ev) {
    ev.preventDefault();
    const newPass = document.getElementById('new-pass').value;
    user.password = newPass;
    localStorage.setItem('users', JSON.stringify(users));
    msg.innerHTML = "<span style='color:green;'>Password changed successfully! <a href='login.html'>Login now</a></span>";
  };
});