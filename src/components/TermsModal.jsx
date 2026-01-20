import React from 'react';
import { X } from 'lucide-react';
import './TermsModal.css';

const TermsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="terms-modal-overlay" onClick={onClose}>
            <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="terms-modal-header">
                    <h2>Terms and Conditions</h2>
                    <button className="terms-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="terms-modal-body">
                    <p><strong>Last Updated:</strong> January 20, 2026</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By creating an account and using AgentApp ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service.</p>

                    <h3>2. Service Description</h3>
                    <p>AgentApp is a customer relationship management (CRM) and automated follow-up platform designed for insurance agents and professionals. The Service provides tools for contact management, automated messaging, landing page creation, and business analytics.</p>

                    <h3>3. User Accounts</h3>
                    <h4>3.1 Account Creation</h4>
                    <ul>
                        <li>You must provide accurate and complete information during registration</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                        <li>You must be at least 18 years old to use this Service</li>
                        <li>One person or entity may not maintain more than one free account</li>
                    </ul>

                    <h4>3.2 Account Security</h4>
                    <ul>
                        <li>You are responsible for all activities that occur under your account</li>
                        <li>Notify us immediately of any unauthorized use of your account</li>
                        <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                    </ul>

                    <h3>4. Data Usage and Privacy</h3>
                    <h4>4.1 Data Collection</h4>
                    <p>We collect and process:</p>
                    <ul>
                        <li>Account information (name, email, phone number)</li>
                        <li>Contact data you input into the system</li>
                        <li>Usage analytics and service interaction data</li>
                        <li>Communication content (emails, messages)</li>
                    </ul>

                    <h4>4.2 Data Protection</h4>
                    <ul>
                        <li>Your data is stored securely using industry-standard encryption</li>
                        <li>We will never sell your personal data to third parties</li>
                        <li>You retain ownership of all contact data you input</li>
                        <li>We comply with applicable data protection regulations</li>
                    </ul>

                    <h3>5. Acceptable Use Policy</h3>
                    <p>You agree NOT to:</p>
                    <ul>
                        <li>Use the Service for any illegal or unauthorized purpose</li>
                        <li>Send spam or unsolicited communications</li>
                        <li>Violate any laws in your jurisdiction</li>
                        <li>Attempt to gain unauthorized access to the Service</li>
                        <li>Interfere with or disrupt the Service</li>
                        <li>Upload malicious code or viruses</li>
                        <li>Impersonate another person or entity</li>
                        <li>Harass, abuse, or harm other users</li>
                    </ul>

                    <h3>6. Service Plans and Billing</h3>
                    <h4>6.1 Free Plan</h4>
                    <ul>
                        <li>Limited features as specified on our pricing page</li>
                        <li>Subject to usage limits and restrictions</li>
                        <li>May be discontinued or modified at our discretion</li>
                    </ul>

                    <h4>6.2 Paid Plans</h4>
                    <ul>
                        <li>Billed monthly or annually as selected</li>
                        <li>Automatic renewal unless cancelled</li>
                        <li>No refunds for partial months</li>
                        <li>Price changes will be communicated 30 days in advance</li>
                    </ul>

                    <h3>7. Limitation of Liability</h3>
                    <p>The Service is provided "as is" without warranties of any kind. We are not liable for any data loss or business interruption. Our total liability is limited to the amount you paid in the last 12 months.</p>

                    <h3>8. Contact Information</h3>
                    <p>For questions about these Terms and Conditions:</p>
                    <p><strong>Email:</strong> agentapp.my@gmail.com<br />
                        <strong>Website:</strong> https://agentapp.my</p>

                    <hr />
                    <p><em>By clicking "I Accept" or creating an account, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.</em></p>
                </div>
                <div className="terms-modal-footer">
                    <button className="terms-accept-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
