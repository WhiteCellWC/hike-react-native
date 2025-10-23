export type Hike = {
  id: number;
  name: string;
  image: string;
  location: string;
  date: number;
  length_value: number;
  length_unit: string;
  description: string;
  difficulty: string;
  parking: boolean;
};

export type Observation = {
  id: number;
  hike_id: number;
  name: string;
  image: string;
  time: number;
  comment: string;
};
