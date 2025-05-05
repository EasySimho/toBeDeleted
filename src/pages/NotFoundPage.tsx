import React from 'react';
import { Link } from 'react-router-dom';
import logo from '/Cti-Isolare-logo.svg'; // Assicurati che il logo sia nella cartella assets

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center overflow-hidden px-4">
      <img src={logo} alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 mb-6 sm:mb-8" />
      <h1 className="text-6xl sm:text-8xl font-extrabold text-blue-600 mb-4 text-center">404</h1>
      <p className="text-lg sm:text-2xl text-gray-700 mb-6 sm:mb-8 text-center">
        Oops! La pagina che stai cercando non esiste.
      </p>
      <Link
        to="/"
        className="px-6 py-3 sm:px-8 sm:py-4 bg-blue-600 text-white text-base sm:text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
      >
        Torna alla Home
      </Link>
    </div>
  );
};

export default NotFoundPage;