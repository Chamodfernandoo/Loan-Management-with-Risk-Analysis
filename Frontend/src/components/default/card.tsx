import { Link } from "react-router-dom";
import React from "react";

export type CardProps = {
  icon: string; // Path to the icon image
  title: string; // Card title
  href: string; // Route to navigate
};

export const ButtonCard: React.FC<CardProps> = ({ icon, title, href }) => {
  return (
    <Link to={href} className="buttoncard">
      <div className="flex flex-col p-3 bg-white rounded-lg drop-shadow-sm border border-blue-300 hover:border hover:border-blue-500 h-max 2xl:hover:scale-105 2xl:active:scale-95 2xl:transition-all duration-300">
        <div className="flex w-14 h-14 p-2 rounded-lg items-center bg-blue-100 justify-center mb-8">
          <img src={icon} alt={title} className="object-center w-12 h-12" />
        </div>
        <div className="flex left-0">
          <h1 className="text-xl font-bold text-blue-950">{title}</h1>
        </div>
      </div>
    </Link>
  );
};
