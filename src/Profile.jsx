import { useState } from 'react';
import FormField from './components/FormField';
import { validateEmail, passwordStrength, validateDOB } from "./lib/validators";


const initialUser = {
  avatarUrl: '',
  firstName: 'Jimmy',
  lastName: 'Lubeta',
  email: 'jimmy@example.com',
  phone: '(555) 123-4567',
  dob: '1999-09-09',
  preferredStylist: 'Any',
};

export default function Profile() {
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  const validate = (f) => {
    const e = {};
    if (!f.firstName) e.firstName = 'First name is required';
    if (!f.lastName) e.lastName = 'Last name is required';
    if (!isEmail?.(f.email)) e.email = 'Enter a valid email';
    if (!isPhone?.(f.phone)) e.phone = 'Enter a valid phone';
    if (!isPastDate?.(f.dob)) e.dob = 'Enter a valid past date';
    return e;
  };

  const onChange = (ev) => {
    const { name, value } = ev.target;
    const next = { ...form, [name]: value };
    setForm(next);
    setErrors(validate(next));
  };

  const onSave = async (ev) => {
    ev.preventDefault();
    const e = validate(form);
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      // TODO: replace with real API call later
      // await api.updateProfile(form);
      setUser(form);
      setEditing(false);
      alert('Profile saved (placeholder)');
    } catch {
      alert('Save failed (placeholder)');
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    setForm(user);
    setErrors({});
    setEditing(false);
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      {/* Overview */}
      <section className="rounded-xl border border-gray-200 bg-white/60 backdrop-blur p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName || 'Guest')}`}
            alt="Avatar"
            className="h-16 w-16 rounded-full object-cover ring-2 ring-gray-200"
          />
          <div>
            <h1 className="text-2xl font-semibold">{fullName || 'Your profile'}</h1>
            <p className="text-gray-600">{user.email}</p>
            <p className="text-gray-600">{user.phone}</p>
          </div>
          {!editing && (
            <button
              className="ms-auto rounded-lg px-4 py-2 bg-black text-white hover:bg-black/90"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
          )}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div><span className="font-medium">DOB:</span> {user.dob || '—'}</div>
          <div><span className="font-medium">Preferred stylist:</span> {user.preferredStylist || '—'}</div>
        </div>
      </section>

      {/* Edit form */}
      {editing && (
        <form onSubmit={onSave} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="First name" name="firstName" value={form.firstName} onChange={onChange} error={errors.firstName} />
            <FormField label="Last name"  name="lastName"  value={form.lastName}  onChange={onChange} error={errors.lastName} />
          </div>

          <FormField type="email" label="Email" name="email" value={form.email} onChange={onChange} error={errors.email} />
          <FormField label="Phone" name="phone" value={form.phone} onChange={onChange} error={errors.phone} placeholder="555-555-5555" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField type="date" label="Date of birth" name="dob" value={form.dob} onChange={onChange} error={errors.dob} />
            <FormField label="Preferred stylist" name="preferredStylist" value={form.preferredStylist} onChange={onChange} placeholder="Any" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving || Object.keys(errors).length > 0}
              className={`rounded-lg px-4 py-2 text-white ${saving || Object.keys(errors).length ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            <button type="button" onClick={onCancel} className="rounded-lg px-4 py-2 border border-gray-300">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
