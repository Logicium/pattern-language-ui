<template>
  <LegalPage title="Privacy Policy" updated="June 2026">
    <p>
      Pattern Language is built around the trust rural communities place in each other.
      This policy explains what we collect, why, and the choices you have.
    </p>

    <h2>What we collect</h2>
    <ul>
      <li>
        <strong>Account info:</strong> name, email, password (hashed), and the community
        profile you provide at signup — location, state, role, current work, goals, and
        the challenges you select.
      </li>
      <li>
        <strong>Google account info</strong> (if you sign in with Google): name, email,
        and profile image as provided by Google.
      </li>
      <li>
        <strong>Content you create:</strong> chat messages with PAL, playbooks, tasks,
        notes, discussion messages, uploaded files, and stories.
      </li>
      <li>
        <strong>Calendar &amp; call data:</strong> if you schedule a meetup or start a
        group call, we create an event and a Google Meet link via Google Calendar.
      </li>
      <li>
        <strong>Operational data:</strong> basic logs (IP, browser, timestamps) needed to
        keep the Service secure and running.
      </li>
    </ul>

    <h2>How we use it</h2>
    <ul>
      <li>To run the Service and personalize your dashboard;</li>
      <li>To generate AI assistance from your prompts and playbook context;</li>
      <li>To send transactional emails (invitations, calendar invites, important notices);</li>
      <li>To improve the Service and diagnose problems.</li>
    </ul>
    <p>
      We do not sell your data. We do not show third-party advertising. We do not train
      external AI models on your private content.
    </p>

    <h2>Who sees what</h2>
    <p>
      Your chats with PAL and your private playbooks are visible only to you and the
      collaborators you invite. When you <em>publish</em> a playbook or story, it becomes
      visible to other authenticated users in the Pattern Language network. You can
      unpublish at any time.
    </p>

    <h2>Service providers</h2>
    <p>
      We rely on a small set of providers to operate the Service: Google (sign-in,
      Calendar, Meet), our cloud hosting and database provider, our email delivery
      provider, and an AI model provider for generating PAL responses. They process data
      under their own terms and only as needed to deliver the Service.
    </p>

    <h2>Your rights</h2>
    <p>
      You can view and update your profile in
      <router-link to="/dashboard/settings">Settings</router-link>, delete content you
      created, and delete your account. On account deletion, your personal information
      and private content are removed; published stories may remain unless you request
      removal at
      <a href="mailto:hello@ruralpatternlanguage.com">hello@ruralpatternlanguage.com</a>.
    </p>

    <h2>Children</h2>
    <p>
      The Service is intended for users 16 and older. Please do not create an account if
      you are younger.
    </p>

    <h2>Security</h2>
    <p>
      We use HTTPS, hashed passwords, and access controls to protect your data. No
      system is perfectly secure; if you believe your account has been compromised,
      contact us immediately.
    </p>

    <h2>Changes</h2>
    <p>
      We may update this policy as the Service evolves. We will note the revision date at
      the top and notify active users of material changes.
    </p>

    <h2>Contact</h2>
    <p>
      Questions or requests about your data:
      <a href="mailto:hello@ruralpatternlanguage.com">hello@ruralpatternlanguage.com</a>.
    </p>
  </LegalPage>
</template>

<script setup lang="ts">
import LegalPage from '@/components/layout/LegalPage.vue'
</script>
