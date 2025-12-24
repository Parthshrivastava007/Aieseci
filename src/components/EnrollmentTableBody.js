import React from "react";

const EnrollmentTableBody = ({
  isAdmin,
  filteredEnrollments,
  editId,
  editData,
  setEditId,
  handleEditChange,
  handleUpdate,
  handleDelete,
  handleEdit,
  setSelectedStudent,
  setShowMarksModal,
}) => {
  const formatDob = (dob) => {
    if (!dob) return "";
    const parts = dob.split("-");
    return parts.length === 3 && parts[0].length === 4
      ? `${parts[2]}-${parts[1]}-${parts[0]}`
      : dob;
  };

  const formatEnrollmentDate = (createdAt) => {
    if (!createdAt?.toDate) return "";
    const date = createdAt.toDate();
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-700 table-auto text-left">
        <thead className="bg-gray-800 text-gray-300">
          <tr>
            <th className="p-3 border">S.No</th>
            <th className="p-3 border">Roll No</th>
            <th className="p-3 border">Name</th>
            <th className="p-3 border">Father Name</th>
            <th className="p-3 border">Email</th>
            <th className="p-3 border">Phone</th>
            <th className="p-3 border">Course</th>
            <th className="p-3 border">Aadhaar</th>
            <th className="p-3 border">Address</th>
            <th className="p-3 border">DOB</th>
            <th className="p-3 border">Enrollment Date</th>
            {isAdmin && <th className="p-3 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredEnrollments.map((entry, index) => {
            const isEditing = editId === entry.id;
            return (
              <tr key={entry.id} className="bg-gray-700">
                <td className="p-3 border">{index + 1}</td>
                {[
                  "rollNo",
                  "name",
                  "fatherName",
                  "email",
                  "phone",
                  "course",
                  "aadhaar",
                  "address",
                  "dob",
                ].map((field) => (
                  <td key={field} className="p-3 border">
                    {isEditing ? (
                      <input
                        name={field}
                        value={editData[field] || ""}
                        onChange={handleEditChange}
                        className="text-black p-1 rounded w-full"
                      />
                    ) : field === "dob" ? (
                      formatDob(entry.dob)
                    ) : (
                      entry[field]
                    )}
                  </td>
                ))}

                <td className="p-3 border">
                  {formatEnrollmentDate(entry.createdAt)}
                </td>

                {isAdmin && (
                  <td className="p-3 border border-gray-600 flex gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditId(null)}
                          className="bg-gray-500 hover:bg-gray-600 px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEdit(entry)}
                          className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(entry);
                            setShowMarksModal(true);
                          }}
                          className="bg-green-600 px-2 py-1 rounded"
                        >
                          Upload Marks
                        </button>
                      </>
                    )}
                  </td>
                )}
              </tr>
            );
          })}

          {filteredEnrollments.length === 0 && (
            <tr>
              <td
                colSpan={isAdmin ? 12 : 11}
                className="text-center py-6 text-gray-400"
              >
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EnrollmentTableBody;
