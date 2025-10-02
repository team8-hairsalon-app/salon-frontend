import { useEffect, useState } from "react";
import { profileApi } from "./lib/profileApi";
import toast from "react-hot-toast";

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });

  // Keep a snapshot so Cancel can revert
  const [original, setOriginal] = useState({
    email: "",
    first_name: "",
    last_name: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await profileApi.getMe();
        if (!mounted) return;
        const values = {
          email: me.email || "",
          first_name: me.first_name || "",
          last_name: me.last_name || "",
        };
        setForm(values);
        setOriginal(values);
      } catch (e) {
        console.error(e);
        toast.error("Couldn’t load your profile.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function onStartEdit() {
    setIsEditing(true);
  }

  function onCancel() {
    setForm(original);     // revert unsaved edits
    setIsEditing(false);
  }

  async function onSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await profileApi.updateMe({
        first_name: form.first_name,
        last_name: form.last_name,
      });
      // update local state & snapshot
      const values = {
        email: updated.email || form.email,
        first_name: updated.first_name || "",
        last_name: updated.last_name || "",
      };
      setForm(values);
      setOriginal(values);

      // refresh navbar greeting
      localStorage.setItem("user_first_name", values.first_name || "");

      toast.success("Profile saved!");
      setIsEditing(false); // <-- return to read-only (Edit button shows)
    } catch (e) {
      console.error(e);
      toast.error("Couldn’t save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="section">
        <h1 className="section-title">Profile</h1>
        <div className="card animate-pulse h-40" />
      </main>
    );
  }

  const nameInputBase =
    "mt-1 w-full rounded-xl border px-3 py-2 outline-none transition";
  const readOnlyStyles = "border-rose-200 bg-rose-50/50 text-salon-dark/80";
  const editableStyles =
    "border-rose-200 focus:ring-2 focus:ring-rose-200 bg-white";

  return (
    <main className="section">
      <div className="flex items-center justify-between gap-4">
        <h1 className="section-title">Profile</h1>

        {!isEditing ? (
          <button
            type="button"
            onClick={onStartEdit}
            className="rounded-xl bg-salon-primary px-4 py-2 text-white font-medium hover:shadow-md"
          >
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-rose-200 px-4 py-2 text-salon-dark hover:bg-rose-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className={`rounded-xl px-4 py-2 text-white font-medium ${
                saving
                  ? "bg-rose-300/60 cursor-not-allowed"
                  : "bg-salon-primary hover:shadow-md"
              }`}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      </div>

      <form className="max-w-2xl space-y-6 mt-4" onSubmit={onSave}>
        {/* Email (always read-only) */}
        <div>
          <label className="block text-sm font-medium text-salon-dark">Email</label>
          <input
            name="email"
            value={form.email}
            readOnly
            className={`${nameInputBase} ${readOnlyStyles}`}
          />
          <p className="mt-1 text-xs text-salon-dark/60">Email can’t be changed.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* First name */}
          <div>
            <label className="block text-sm font-medium text-salon-dark">First name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              readOnly={!isEditing}
              className={`${nameInputBase} ${
                isEditing ? editableStyles : readOnlyStyles
              }`}
              placeholder="First name"
            />
          </div>

          {/* Last name */}
          <div>
            <label className="block text-sm font-medium text-salon-dark">Last name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={onChange}
              readOnly={!isEditing}
              className={`${nameInputBase} ${
                isEditing ? editableStyles : readOnlyStyles
              }`}
              placeholder="Last name"
            />
          </div>
        </div>
      </form>
    </main>
  );
}