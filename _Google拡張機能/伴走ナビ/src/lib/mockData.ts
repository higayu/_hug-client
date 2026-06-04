export type Facility = { facility_id: number; name: string };
export type Child = { child_id: number; name: string };
export type SupportRecord = {
  record_id: number;
  target_date: string;
  content: string;
};

export const MOCK_FACILITIES: Facility[] = [
  { facility_id: 1, name: '吉島事業所' },
  { facility_id: 2, name: 'ひまわり教室' },
];

export const MOCK_CHILDREN: Record<number, Child[]> = {
  1: [
    { child_id: 1, name: '山田 太郎' },
    { child_id: 2, name: '佐藤 花子' },
  ],
  2: [{ child_id: 3, name: '鈴木 一郎' }],
};

export const MOCK_RECORDS: SupportRecord[] = [
  {
    record_id: 101,
    target_date: '2026-05-01T00:00:00.000Z',
    content: '公園で遊び、笑顔が多かった。',
  },
  {
    record_id: 102,
    target_date: '2026-05-02T00:00:00.000Z',
    content: '新しい職員に少し緊張した様子。',
  },
  {
    record_id: 103,
    target_date: '2026-05-03T00:00:00.000Z',
    content: '工作活動に積極的に参加。',
  },
];
