export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
};

export const sampleParticipants = [
  {
    id: 1,
    uuid: generateUUID(),
    name: '王小明',
    phone: '0912-345-678',
    email: 'wang@example.com',
    address: '台北市大安區羅斯福路四段1號',
    birthDate: '1990-05-15',
    gender: '男',
    projectStatus: {
      '認知行為研究計畫-老化與認知（AGE）': {
        status: '進行中',
        participantProjectId: 'COG-001',
        participantSubProjectId: 'AGE-001',
        terminationReason: '',
        consentVersions: ['v1.0', 'v1.1'],
        joinDate: '2024-01-15'
      }
    }
  }
];

export const sampleProjects = [
  {
    id: 1,
    projectName: '認知行為研究計畫',
    projectCode: 'COG',
    subProjectName: '老化與認知',
    subProjectCode: 'AGE',
    researcherName: '王博士',
    researcherEmail: 'dr.wang@psychology.edu',
    description: '本研究旨在探討老化過程中認知功能的變化，透過系列神經心理測驗評估參與者的認知表現。'
  }
];
