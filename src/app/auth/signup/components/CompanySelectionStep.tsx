interface CompanySelectionStepProps {
  companySelection: {
    option: string;
    companyName: string;
    joinCode: string;
  };
  setCompanySelection: (data: any) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
}

export function CompanySelectionStep({
  companySelection,
  setCompanySelection,
  onBack,
  onSubmit,
  loading,
}: CompanySelectionStepProps) {
  const handleOptionSelect = (option: string) => {
    setCompanySelection({ ...companySelection, option });
  };

  const canSubmit = () => {
    if (companySelection.option === "create") {
      return companySelection.companyName.trim().length > 0;
    }
    if (companySelection.option === "join") {
      return companySelection.joinCode.trim().length > 0;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Company Setup
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Choose how you&apos;d like to set up your company access
      </p>

      {/* Option Cards */}
      <div className="space-y-4">
        {/* Option 1: Create New Company */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            companySelection.option === "create"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onClick={() => handleOptionSelect("create")}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                companySelection.option === "create"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {companySelection.option === "create" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Create New Company
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You&apos;re the first person from your organization. You&apos;ll
                become the company admin.
              </p>

              {companySelection.option === "create" && (
                <div className="mt-3">
                  <label
                    htmlFor="companyName"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Company Name
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800"
                    placeholder="Enter your company name"
                    value={companySelection.companyName}
                    onChange={(e) =>
                      setCompanySelection({
                        ...companySelection,
                        companyName: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Option 2: Join with Code */}
        <div
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            companySelection.option === "join"
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
          onClick={() => handleOptionSelect("join")}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                companySelection.option === "join"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-400 dark:border-gray-500"
              }`}
            >
              {companySelection.option === "join" && (
                <div className="w-2 h-2 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Join with Code
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                You have a 6-digit join code from your company admin.
              </p>

              {companySelection.option === "join" && (
                <div className="mt-3">
                  <label
                    htmlFor="joinCode"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Join Code
                  </label>
                  <input
                    id="joinCode"
                    type="text"
                    required
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-800 uppercase"
                    placeholder="Enter 6-digit code (e.g., A1B2C3)"
                    value={companySelection.joinCode}
                    onChange={(e) =>
                      setCompanySelection({
                        ...companySelection,
                        joinCode: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={6}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Option 3: Email Invites (Coming Soon) */}
        <div className="border-2 rounded-lg p-4 cursor-not-allowed opacity-50 border-gray-300 dark:border-gray-600">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center mt-0.5"></div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white">
                Check Email Invites
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Check if you have pending email invitations.
              </p>
              <div className="mt-2">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 text-xs px-2 py-1 rounded">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onBack}
          className="flex-1 py-2 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={!canSubmit() || loading}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </div>
    </div>
  );
}
