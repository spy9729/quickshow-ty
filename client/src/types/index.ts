export interface Movie {
  _id?: string;
  id?: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  overview: string;
  runtime: number;
  genres: { id?: number; name: string }[];
  release_date: string;
  vote_count: number;
  casts: { name: string; profile_path: string }[];
}

export interface Show {
  _id?: string;
  id?: string;
  movie: Movie;
  showDateTime: string;
  showPrice: number;
  dateTime?: Record<string, any>;
  occupiedSeats?: Record<string, any>;
}

export interface User {
  _id?: string;
  name: string;
  email: string;
  image: string;
}
export interface Booking {
  _id?: string;
  user: User;
  show: Show;
  bookedSeats: string[];
  amount: number;
  isPaid: boolean;
  paymentLink?: string;
}

export interface Genre {
  id?: number;
  name: string;
}

export interface Cast {
  name: string;
  profile_path: string;
}

export interface TimeSlot {
  showId: string;
  time: string;
}
