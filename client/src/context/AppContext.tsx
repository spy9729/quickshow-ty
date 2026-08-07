import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import axios, { AxiosInstance } from "axios";
import { useAuth, useUser } from "@clerk/react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

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

export interface AppContextType {
  axios: AxiosInstance;
  user: any;
  getToken: () => Promise<string | null>;
  image_base_url: string;
  shows: Show[];
  favoriteMovies: Movie[];
  fetchFavoriteMovies: () => Promise<void>;
  isAdmin: boolean;
  fetchIsAdmin: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [shows, setShows] = useState([]);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user } = useUser();
  const { getToken } = useAuth();
  const location = useLocation();

  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });
      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorised to access admin dashboard!");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");
      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchIsAdmin();
      fetchFavoriteMovies();
    }
  }, [user]);

  useEffect(() => {
    fetchShows();
  }, []);

  const value: AppContextType = {
    axios,
    fetchIsAdmin,
    user,
    getToken,
    isAdmin,
    shows,
    favoriteMovies,
    fetchFavoriteMovies,
    image_base_url,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
