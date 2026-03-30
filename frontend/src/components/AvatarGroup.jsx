export default function AvatarGroup({ users = [], currentUserName = "You" }) {
  const visibleUsers = users.slice(0, 3);
  const overflowCount = Math.max(users.length - 3, 0);

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  const getColor = (name) => {
    const palette = [
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-fuchsia-500 to-pink-500",
      "from-violet-500 to-purple-500",
      "from-rose-500 to-red-500",
    ];
    const hash = name.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return palette[hash % palette.length];
  };

  return (
    <div className="flex items-center">
      <div className="flex -space-x-3">
        <div className="relative z-20 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-sm font-semibold text-white shadow-sm">
          {getInitials(currentUserName)}
        </div>

        {visibleUsers.map((user, index) => (
          <div
            key={user.userId}
            className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br ${getColor(
              user.userName
            )} text-sm font-semibold text-white shadow-sm transition-transform duration-300 hover:-translate-y-0.5`}
            style={{ zIndex: 10 - index }}
            title={user.userName}
          >
            {getInitials(user.userName)}
          </div>
        ))}

        {overflowCount > 0 ? (
          <div className="relative z-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-sm font-semibold text-slate-700 shadow-sm">
            +{overflowCount}
          </div>
        ) : null}
      </div>
    </div>
  );
}
