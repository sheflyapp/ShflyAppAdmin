import React, { useState } from 'react';
import SpecializationSelector from './SpecializationSelector';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABEL = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

const Field = ({ label, full = false, children }) => (
  <div className={full ? 'col-span-full' : ''}>
    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const Check = ({ id, label, checked, onChange }) => (
  <label htmlFor={id} className="flex items-center gap-2 self-end py-2 text-sm text-gray-900">
    <input
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
    {label}
  </label>
);

const dateInputValue = (v) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

/**
 * All admin-editable fields of a user, for the edit drawers.
 * `value` is the user being edited; `onChange(patch)` merges a partial update.
 * Render inside an `.auto-grid`.
 */
const UserEditFields = ({ value, onChange, showUserType = false }) => {
  const isProvider = value.userType === 'provider';
  const [languagesText, setLanguagesText] = useState((value.languages || []).join(', '));
  const set = (key) => (e) => onChange({ [key]: e.target.value });

  return (
    <>
      <Field label="Full Name">
        <input type="text" className="input-field" value={value.fullname || ''} onChange={set('fullname')} />
      </Field>
      <Field label="Username">
        <input type="text" className="input-field" value={value.username || ''} onChange={set('username')} />
      </Field>
      <Field label="Email">
        <input type="email" className="input-field" value={value.email || ''} onChange={set('email')} />
      </Field>
      <Field label="Phone">
        <input type="tel" className="input-field" value={value.phone || ''} onChange={set('phone')} />
      </Field>

      {showUserType && (
        <Field label="User Type">
          <select className="input-field" value={value.userType} onChange={set('userType')}>
            <option value="seeker">Seeker</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
      )}
      <Field label="Gender">
        <select className="input-field" value={value.gender || 'other'} onChange={set('gender')}>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </Field>
      <Field label="Date of Birth">
        <input
          type="date"
          className="input-field"
          value={dateInputValue(value.dob)}
          onChange={set('dob')}
        />
      </Field>
      <Field label="Country">
        <input type="text" className="input-field" value={value.country || ''} onChange={set('country')} />
      </Field>
      <Field label="City">
        <input type="text" className="input-field" value={value.city || ''} onChange={set('city')} />
      </Field>
      <Field label="Languages (comma separated)">
        <input
          type="text"
          className="input-field"
          value={languagesText}
          placeholder="English, Arabic"
          onChange={(e) => {
            setLanguagesText(e.target.value);
            onChange({
              languages: e.target.value.split(',').map((l) => l.trim()).filter(Boolean),
            });
          }}
        />
      </Field>

      {isProvider && (
        <Field label="Price per Hour">
          <input
            type="number"
            min="0"
            step="0.01"
            className="input-field"
            value={value.price ?? 0}
            onChange={(e) => onChange({ price: parseFloat(e.target.value) || 0 })}
          />
        </Field>
      )}

      <Field label="Bio" full>
        <textarea
          rows={3}
          maxLength={500}
          className="input-field"
          value={value.bio || ''}
          onChange={set('bio')}
        />
        <p className="mt-1 text-xs text-gray-500">{(value.bio || '').length}/500</p>
      </Field>

      <div className="col-span-full">
        <SpecializationSelector
          selectedSpecializations={value.specializations || []}
          onSpecializationsChange={(specializations) => onChange({ specializations })}
          required={value.userType !== 'admin'}
          userType={value.userType}
        />
      </div>

      {isProvider && (
        <>
          <div className="col-span-full">
            <span className="mb-1 block text-sm font-medium text-gray-700">Consultation Types</span>
            <div className="flex flex-wrap gap-x-6">
              <Check id="edit-chat" label="Chat" checked={value.chat} onChange={(v) => onChange({ chat: v })} />
              <Check id="edit-call" label="Call" checked={value.call} onChange={(v) => onChange({ call: v })} />
              <Check id="edit-video" label="Video" checked={value.video} onChange={(v) => onChange({ video: v })} />
            </div>
          </div>
          <div className="col-span-full">
            <span className="mb-1 block text-sm font-medium text-gray-700">Weekly Availability</span>
            <div className="flex flex-wrap gap-x-5">
              {DAYS.map((day) => (
                <Check
                  key={day}
                  id={`edit-${day}`}
                  label={DAY_LABEL[day]}
                  checked={value.availability?.[day]}
                  onChange={(v) => onChange({ availability: { ...(value.availability || {}), [day]: v } })}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <Check
        id="edit-verified"
        label="Verified"
        checked={value.isVerified}
        onChange={(v) => onChange({ isVerified: v })}
      />
      <Check
        id="edit-active"
        label="Active"
        checked={value.isActive}
        onChange={(v) => onChange({ isActive: v })}
      />
    </>
  );
};

export default UserEditFields;
