export const lessonStructure = [
  {
    moduleNum: 1,
    title: 'SELinux Fundamentals',
    lessons: [
      { id: '1-1-intro', title: '1.1: Introduction to SELinux', points: 100 },
      { id: '1-2-modes', title: '1.2: SELinux Modes', points: 150 },
      { id: '1-3-contexts', title: '1.3: SELinux Contexts', points: 200 },
    ],
  },
  {
    moduleNum: 2,
    title: 'Working with SELinux',
    lessons: [
      { id: '2-1-booleans', title: '2.1: Boolean Management', points: 200 },
      { id: '2-2-file-contexts', title: '2.2: File Context Management', points: 250 },
      { id: '2-3-troubleshooting', title: '2.3: Troubleshooting SELinux', points: 300 },
    ],
  },
  {
    moduleNum: 3,
    title: 'Policy Development',
    lessons: [
      { id: '3-1-policy-modules', title: '3.1: Understanding Policy Modules', points: 250 },
      { id: '3-2-custom-policies', title: '3.2: Creating Custom Policies', points: 300 },
      { id: '3-3-network-context', title: '3.3: Port and Network Context', points: 200 },
    ],
  },
  {
    moduleNum: 4,
    title: 'Nginx Capstone Project',
    lessons: [
      { id: '4-1-nginx-setup', title: '4.1: Nginx Installation & Setup', points: 200 },
      { id: '4-2-custom-root', title: '4.2: Custom Document Root', points: 300 },
      { id: '4-3-custom-port', title: '4.3: Custom Port Configuration', points: 300 },
      { id: '4-4-reverse-proxy', title: '4.4: Reverse Proxy Policy', points: 400 },
      { id: '4-5-policy-module', title: '4.5: Custom Policy Module', points: 500 },
    ],
  },
];
