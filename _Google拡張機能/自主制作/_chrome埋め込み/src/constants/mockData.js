export const SAMPLE_PR_RECORDS = [
  {
    id: 'A-1001',
    date: '2026-05-28',
    child: '山田 太郎',
    content: '午前中は集団活動に参加し、他児との会話を楽しみました。',
  },
  {
    id: 'A-1002',
    date: '2026-05-29',
    child: '山田 太郎',
    content: '午後の個別課題では集中力が続き、最後まで取り組めました。',
  },
]

export const MOCK_FACILITIES = [
  { facility_id: 1, name: '吉島事業所' },
  { facility_id: 2, name: 'ひまわり教室' },
]

export const MOCK_CHILDREN = {
  1: [
    { child_id: 1, name: '山田 太郎' },
    { child_id: 2, name: '佐藤 花子' },
  ],
  2: [{ child_id: 3, name: '鈴木 一郎' }],
}

export const MOCK_RECORDS = SAMPLE_PR_RECORDS.map((record, index) => ({
  record_id: record.id,
  child_id: 1,
  target_date: `${record.date}T00:00:00.000Z`,
  content: record.content,
  index,
}))
