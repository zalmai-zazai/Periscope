// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import Link from "next/link";

// export default function AcceptInvitePage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [loading, setLoading] = useState(false);
//   const [inviteData, setInviteData] = useState<{
//     companyName: string;
//     role: string;
//   } | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   // Check invite validity when component mounts
//   useEffect(() => {
//     if (token) {
//       checkInviteValidity();
//     }
//   }, [token]);

//   const checkInviteValidity = async () => {
//     try {
//       const response = await fetch("/api/invites/check", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ token }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setInviteData(result.data);
//       } else {
//         setError(result.error || "Invalid invitation");
//       }
//     } catch (error) {
//       setError("Failed to validate invitation");
//     }
//   };

//   const handleAcceptInvite = async () => {
//     if (!token) return;

//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/invites/accept", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ token }),
//       });

//       const result = await response.json();

//       if (result.success) {
//         setSuccess(true);
//         // Redirect to dashboard after 2 seconds
//         setTimeout(() => {
//           router.push("/dashboard");
//         }, 2000);
//       } else {
//         setError(result.error || "Failed to accept invitation");
//       }
//     } catch (error) {
//       setError("Failed to accept invitation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!token) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
//         <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
//           <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-red-600 dark:text-red-400 text-2xl">❌</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//             Invalid Invitation
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 mb-6">
//             This invitation link is missing a token. Please check your email for
//             the complete invitation link.
//           </p>
//           <Link
//             href="/auth/signin"
//             className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//           >
//             Go to Sign In
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   if (error && !inviteData) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
//         <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
//           <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-red-600 dark:text-red-400 text-2xl">❌</span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//             Invalid Invitation
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
//           <div className="space-y-3">
//             <Link
//               href="/auth/signin"
//               className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               Go to Sign In
//             </Link>
//             <p className="text-sm text-gray-500 dark:text-gray-400">
//               If you believe this is an error, please contact the company admin.
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (success) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
//         <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center">
//           <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-green-600 dark:text-green-400 text-2xl">
//               ✅
//             </span>
//           </div>
//           <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//             Welcome to the Team!
//           </h1>
//           <p className="text-gray-600 dark:text-gray-300 mb-6">
//             You have successfully joined{" "}
//             <strong>{inviteData?.companyName}</strong> as a{" "}
//             <strong>{inviteData?.role}</strong>
//           </p>
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
//             Redirecting to your dashboard...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
//       <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
//         <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
//           <span className="text-blue-600 dark:text-blue-400 text-2xl">👥</span>
//         </div>

//         <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
//           Company Invitation
//         </h1>

//         {inviteData ? (
//           <>
//             <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
//               <p className="text-center text-gray-700 dark:text-gray-300">
//                 You have been invited to join
//               </p>
//               <p className="text-center font-semibold text-lg text-blue-700 dark:text-blue-300 mt-1">
//                 {inviteData.companyName}
//               </p>
//               <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
//                 as a{" "}
//                 <span className="capitalize font-medium">
//                   {inviteData.role}
//                 </span>
//               </p>
//             </div>

//             <div className="space-y-4">
//               <button
//                 onClick={handleAcceptInvite}
//                 disabled={loading}
//                 className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {loading ? "Accepting..." : "Accept Invitation"}
//               </button>

//               <Link
//                 href="/auth/signin"
//                 className="block text-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
//               >
//                 I have an account
//               </Link>
//             </div>

//             <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6">
//               By accepting, you agree to join {inviteData.companyName} and will
//               be redirected to the application.
//             </p>
//           </>
//         ) : (
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//             <p className="text-gray-600 dark:text-gray-300">
//               Validating your invitation...
//             </p>
//           </div>
//         )}

//         {error && (
//           <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">
//             {error}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
