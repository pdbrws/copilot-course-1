document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Fetch and display activities
  async function loadActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and activity options
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Create cards for each activity
      Object.entries(activities).forEach(([name, details]) => {
        const card = document.createElement("div");
        card.className = "activity-card";

        // Build participants list with delete icon
        const participantsHtml = details.participants.map(email => `
          <li class="participant-item">
            <span class="participant-email">${email}</span>
            <span class="delete-icon" title="Remove participant" data-activity="${encodeURIComponent(name)}" data-email="${encodeURIComponent(email)}">&#128465;</span>
          </li>
        `).join('');

        card.innerHTML = `
                <h4>${name}</h4>
                <p><strong>Description:</strong> ${details.description}</p>
                <p><strong>Schedule:</strong> ${details.schedule}</p>
                <p><strong>Available Spots:</strong> ${details.max_participants - details.participants.length} of ${details.max_participants}</p>
                <div class="participants-list">
                    <h5>Current Participants:</h5>
                    <ul class="participants-ul">
                        ${participantsHtml}
                    </ul>
                </div>
            `;

        activitiesList.appendChild(card);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Add event listeners for delete icons
      document.querySelectorAll('.delete-icon').forEach(icon => {
        icon.addEventListener('click', async (e) => {
          const activity = decodeURIComponent(icon.getAttribute('data-activity'));
          const email = decodeURIComponent(icon.getAttribute('data-email'));
          if (!confirm(`Remove ${email} from ${activity}?`)) return;
          try {
            const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email })
            });
            if (!response.ok) {
              throw new Error(await response.text());
            }
            messageDiv.textContent = `Unregistered ${email} from ${activity}`;
            messageDiv.className = "message success";
            messageDiv.classList.remove("hidden");
            loadActivities();
          } catch (error) {
            messageDiv.textContent = "Error unregistering: " + error.message;
            messageDiv.className = "message error";
            messageDiv.classList.remove("hidden");
          }
        });
      });
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      messageDiv.textContent = "Successfully signed up for the activity!";
      messageDiv.className = "message success";
      messageDiv.classList.remove("hidden");

      // Reload activities to show updated participants
      loadActivities();

      // Reset form
      event.target.reset();
    } catch (error) {
      messageDiv.textContent = "Error signing up for activity: " + error.message;
      messageDiv.className = "message error";
      messageDiv.classList.remove("hidden");
    }
  });

  // Load activities when page loads
  loadActivities();
});
