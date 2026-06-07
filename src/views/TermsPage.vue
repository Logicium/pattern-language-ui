<template>
  <LegalPage title="Terms of Service" updated="June 2026">
    <p>
      Welcome to Pattern Language. These terms govern your use of
      <a href="https://ruralpatternlanguage.com">ruralpatternlanguage.com</a> and the
      tools, AI assistance, and collaboration features we provide (the "Service"). By creating
      an account, you agree to these terms.
    </p>

    <h2>What we offer</h2>
    <p>
      Pattern Language is a collaborative tool that helps rural communities design,
      plan, and implement responses to complex challenges. The Service includes an AI
      assistant (PAL), playbooks, group discussion, calendar and video-call integration,
      and the ability to publish stories. The Service is currently in
      <router-link to="/beta">beta</router-link>; features may change without notice.
    </p>

    <h2>Your account</h2>
    <p>
      You must provide accurate information when signing up and keep your credentials
      secure. You are responsible for activity that occurs through your account. If you
      sign in with Google, you authorize us to receive the basic profile information
      Google shares with us.
    </p>

    <h2>Acceptable use</h2>
    <p>You agree not to use the Service to:</p>
    <ul>
      <li>Post unlawful, harassing, hateful, or deceptive content;</li>
      <li>Impersonate another person or community;</li>
      <li>Upload malware, attempt to gain unauthorized access, or interfere with the Service;</li>
      <li>Scrape, copy, or reproduce the Service in bulk without permission;</li>
      <li>Misuse the AI assistant to generate content that violates these terms or the law.</li>
    </ul>

    <h2>Your content</h2>
    <p>
      You retain ownership of the playbooks, messages, and stories you create. By posting
      content, you grant us a limited license to host, display, and process it so we can
      operate the Service — including showing your community's published stories to other
      users when you choose to publish them.
    </p>
    <p>
      AI-assisted output is generated based on your inputs and may be inaccurate. Review
      and validate anything you rely on. You are responsible for how you use AI-assisted
      content.
    </p>

    <h2>Video calls and calendar</h2>
    <p>
      If you start an instant call or schedule a meetup, the Service may create a Google
      Calendar event and a Google Meet link on your behalf. Use of those services is also
      subject to Google's terms. Recordings are not made by us; if a participant records,
      that is their responsibility to disclose.
    </p>

    <h2>Termination</h2>
    <p>
      You may delete your account at any time from
      <router-link to="/dashboard/settings">Settings</router-link>. We may suspend or
      terminate accounts that violate these terms or pose a risk to other users.
    </p>

    <h2>Disclaimer</h2>
    <p>
      The Service is provided "as is" while in beta. We do not warrant uninterrupted or
      error-free operation. To the maximum extent permitted by law, we disclaim all
      warranties and limit our liability to the amount you have paid us in the prior
      twelve months (which, during beta, is $0).
    </p>

    <h2>Changes</h2>
    <p>
      We may update these terms as the Service evolves. We will note the revision date at
      the top and, for material changes, notify active users by email or in-app.
    </p>

    <h2>Contact</h2>
    <p>
      Questions? Reach us at
      <a href="mailto:hello@ruralpatternlanguage.com">hello@ruralpatternlanguage.com</a>.
    </p>
  </LegalPage>
</template>

<script setup lang="ts">
import LegalPage from '@/components/layout/LegalPage.vue'
</script>
