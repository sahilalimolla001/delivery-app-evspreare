import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const policies = {
  terms: {
    title: 'Terms & Conditions',
    sections: [
      ['Eligibility', 'You must be legally capable of contracting in India, hold a valid mobile number, provide accurate KYC and vehicle details, and maintain approvals required for delivery work.'],
      ['Orders', 'Orders are assigned based on availability, approval status, location, workload, and operational rules. One active order may be assigned at a time.'],
      ['Suspension', 'Access may be paused or blocked for fraud risk, unsafe conduct, repeated cancellations, false documents, customer harm, payment misuse, or legal compliance reasons.'],
      ['Law', 'These terms are governed by Indian law and applicable courts or forums may handle disputes subject to local jurisdiction.'],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      ['Data Collected', 'We may collect name, phone number, vehicle details, KYC documents, device information, app activity, support messages, payout details, order activity, and location when required for delivery.'],
      ['Purpose', 'Data is used for account verification, rider approval, order assignment, route support, fraud prevention, safety, payouts, support, audits, and legal compliance.'],
      ['Sharing', 'Data may be shared with warehouses, customers where needed for delivery, payment partners, map or OTP providers, cloud vendors, auditors, law enforcement, and regulators.'],
      ['Rights', 'Subject to applicable law, you may request access, correction, update, erasure, consent withdrawal, grievance redressal, and nomination for data rights.'],
    ],
  },
  agreement: {
    title: 'User Agreement',
    sections: [
      ['Duties', 'You agree to maintain valid documents, obey traffic rules, avoid restricted items, protect customer privacy, report incidents, and follow delivery instructions.'],
      ['No Misuse', 'Do not manipulate GPS, mark false delivery, collect unauthorised cash, substitute goods, create duplicate accounts, harass users, or misuse platform data.'],
      ['Equipment', 'You are responsible for your vehicle, phone, internet, safety gear, fuel, and lawful operation unless separately agreed in writing.'],
      ['Termination', 'Either side may stop platform use. Existing dues, investigations, complaints, document obligations, and legal records may continue after deactivation.'],
    ],
  },
  payments: {
    title: 'Payment Policy',
    sections: [
      ['Earnings', 'Earnings may include base pay, distance pay, surge, tips, incentives, reimbursements, and adjustments shown in app or backend records.'],
      ['Payouts', 'Payouts are processed to approved payment details after checks. Timelines may vary due to bank holidays, partner issues, KYC review, or dispute holds.'],
      ['COD', 'Cash collected from customers must be deposited or settled as instructed. Unsettled COD may be adjusted against earnings or recovered as permitted by law and contract.'],
      ['Taxes', 'You are responsible for personal tax compliance unless tax deduction, invoice, or reporting obligations are handled by the platform under applicable law.'],
    ],
  },
  grievance: {
    title: 'Grievance & Compliance',
    sections: [
      ['Support Channel', 'Use Help & Support for operational issues, payment disputes, document review, account status, safety incidents, and data requests.'],
      ['Data Grievance', 'Privacy and data requests may include access, correction, update, erasure, consent withdrawal, and complaint escalation where applicable.'],
      ['Emergency', 'For accidents, threats, police matters, medical emergencies, or unsafe deliveries, contact local emergency services first and then notify support.'],
      ['Records', 'Complaints and resolutions may be retained for audit, legal defence, regulatory, fraud prevention, and service improvement purposes.'],
    ],
  },
  conduct: {
    title: 'Code of Conduct',
    sections: [
      ['Customer Respect', 'Be polite, avoid arguments, do not request unrelated personal information, and use approved contact channels only.'],
      ['Safety', 'Follow traffic laws, avoid rash driving, do not deliver under the influence, and do not carry unauthorised passengers for orders.'],
      ['Integrity', 'Do not fake location, delivery proof, customer OTP, cash collection, item status, or order completion.'],
      ['Privacy', 'Do not photograph, store, share, or misuse customer address, phone number, order details, or warehouse information except as needed for delivery.'],
    ],
  },
};

const PolicyScreen = ({ navigation, route }) => {
  const policy = policies[route.params?.type] || policies.terms;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{policy.title}</Text>
        </View>
        {policy.sections.map(([heading, body]) => (
          <View key={heading} style={styles.card}>
            <Text style={styles.heading}>{heading}</Text>
            <Text style={styles.body}>{body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 8,
  },
  backText: {
    color: '#1E5BA8',
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#000',
  },
  card: {
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  body: {
    fontSize: 13,
    color: '#667085',
    lineHeight: 20,
  },
});

export default PolicyScreen;
