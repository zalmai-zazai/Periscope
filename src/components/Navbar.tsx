import React from "react";
import { ThemeToggle } from "./theme-toggle";
import { LogoutButton } from "./LogoutButton";
import Link from "next/link";

interface NavbarProps {
  isAdmin: boolean;
  session: any; // Use 'any' for now, or define a proper Session type later
}

const Navbar = ({ isAdmin, session }: NavbarProps) => {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Dashboard Title */}

          <Link
            href="/dashboard"
            className="text-blue-600 dark:text-blue-400  text-sm sm:text-base"
          >
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              PeriScope
            </h1>
          </Link>

          {/* User Info Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Welcome text - shows only name on mobile, full message on larger screens */}
            <span className="text-gray-600 text-sm dark:text-gray-300">
              <span className="sm:hidden">
                Hi, {session.user?.name?.split(" ")[0]}
              </span>
              <span className="hidden sm:inline">
                Welcome, {session.user?.name}!
              </span>
            </span>

            {/* Role badge */}
            <span
              className={`px-2 py-1 text-xs rounded-full capitalize ${
                isAdmin
                  ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
              }`}
            >
              {session.user?.role}
            </span>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Logout Button */}
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
