import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon,
} from '@heroicons/react/24/solid';
import {
  DetailSection,
  DetailField,
  Chips,
  formatDate,
  initialsOf,
  isEmpty,
} from './DetailView';

const TONES = {
  green: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  purple: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  blue: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  gray: 'bg-surface-2 text-muted border border-line',
};

const Pill = ({ tone = 'gray', children }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
  >
    {children}
  </span>
);

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABEL = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};
const DOC_TYPE_LABEL = {
  certificate: 'Certificate', license: 'License', degree: 'Degree', id_proof: 'ID proof', other: 'Other',
};

const ageFrom = (dob) => {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const beforeBirthday =
    now.getMonth() < d.getMonth() || (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 130 ? age : null;
};

const signInMethod = (u) => {
  if (u.googleId) return 'Google';
  if (u.facebookId) return 'Facebook';
  if (u.appleId) return 'Apple';
  return u.socialLogin ? 'Social login' : 'Email & password';
};

const Rating = ({ rating, reviews }) => {
  if (!reviews && !rating) return <span className="font-normal text-muted">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1">
      <StarIcon className="h-4 w-4 text-amber-400" />
      {Number(rating).toFixed(1)}
      <span className="font-normal text-muted">({reviews || 0} reviews)</span>
    </span>
  );
};

const userBasics = (user) => {
  const isProvider = user.userType === 'provider';
  return {
    isProvider,
    typeLabel: isProvider ? 'Provider' : user.userType === 'seeker' ? 'Seeker' : 'Admin',
    displayName: user.fullname || user.username || user.email,
  };
};

/** One row for the drawer's fixed header: avatar, "Details - name", role / status / verified chips. */
export const UserDetailsHeader = ({ user }) => {
  const { isProvider, typeLabel, displayName } = userBasics(user);
  return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {user.profileImage ? (
            <img src={user.profileImage} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-base font-bold text-brand">
              {initialsOf(displayName)}
            </span>
          )}
          <h3 className="min-w-0 truncate text-lg font-semibold leading-tight text-fg" title={displayName}>
            <span className="text-muted">Details</span>
            <span className="px-1.5 text-muted" aria-hidden="true">-</span>
            {displayName}
          </h3>
          <Pill tone={isProvider ? 'purple' : 'gray'}>{typeLabel}</Pill>
          <Pill tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Inactive'}</Pill>
          <Pill tone={user.isVerified ? 'blue' : 'amber'}>{user.isVerified ? 'Verified' : 'Unverified'}</Pill>
        </div>
  );
};

/**
 * Everything the API stores about a provider or seeker, grouped for reading.
 * `user` is an item from /api/admin/users (specializations are populated).
 */
const UserDetails = ({ user }) => {
  const isProvider = user.userType === 'provider';
  const specializations = (user.specializations || []).map((s) => s.name || String(s));
  const documents = user.documents || [];
  const languages = user.languages || [];
  const age = user.dob ? ageFrom(user.dob) : null;

  const modes = [
    { key: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon },
    { key: 'call', label: 'Call', icon: PhoneIcon },
    { key: 'video', label: 'Video', icon: VideoCameraIcon },
  ];

  return (
    <>
      <DetailSection title="Profile">
        <DetailField label="Full Name">
          {user.fullname || <span className="font-normal text-muted">Not provided</span>}
        </DetailField>
        <DetailField label="Username">{user.username && `@${user.username}`}</DetailField>
        <DetailField label="Email">{user.email}</DetailField>
        <DetailField label="Phone">{user.phone}</DetailField>
        <DetailField label="Gender">
          <span className="capitalize">{user.gender}</span>
        </DetailField>
        <DetailField label="Date of Birth">
          {formatDate(user.dob) && `${formatDate(user.dob)}${age !== null ? ` (${age} yrs)` : ''}`}
        </DetailField>
        <DetailField label="Location">
          {[user.city, user.country].filter((v) => !isEmpty(v)).join(', ')}
        </DetailField>
        <DetailField label="Languages">
          {languages.length > 0 ? <Chips items={languages} /> : null}
        </DetailField>
        <DetailField label="Bio" wide>
          {user.bio && <span className="whitespace-pre-wrap font-normal">{user.bio}</span>}
        </DetailField>
      </DetailSection>

      {isProvider && (
        <DetailSection title="Professional" cols={3}>
          <DetailField label="Rate">{user.price > 0 ? `$${user.price}/hour` : 'Not set'}</DetailField>
          <DetailField label="Rating">
            <Rating rating={user.rating} reviews={user.totalReviews} />
          </DetailField>
          <DetailField label="Consultation Types">
            <div className="flex flex-wrap gap-2">
              {modes.map(({ key, label, icon: Icon }) => (
                <Pill key={key} tone={user[key] ? 'green' : 'gray'}>
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {!user[key] && <span className="font-normal opacity-70"> · off</span>}
                </Pill>
              ))}
            </div>
          </DetailField>
          <div className="auto-grid auto-grid-sm col-span-full gap-x-4 gap-y-5" style={{ '--max-cols': 2 }}>
            <DetailField label="Specializations">
              {specializations.length > 0 ? <Chips items={specializations} /> : null}
            </DetailField>
            <DetailField label="Weekly Availability">
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => {
                  const on = !!user.availability?.[day];
                  return (
                    <span
                      key={day}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        on ? 'bg-brand text-brand-fg' : 'border border-line bg-surface text-muted/70 line-through'
                      }`}
                    >
                      {DAY_LABEL[day]}
                    </span>
                  );
                })}
              </div>
            </DetailField>
          </div>
        </DetailSection>
      )}

      {!isProvider && (
        <DetailSection title="Interests">
          <DetailField label="Categories" wide>
            {specializations.length > 0 ? <Chips items={specializations} /> : null}
          </DetailField>
        </DetailSection>
      )}

      {isProvider && (
        <DetailSection title={`Documents (${documents.length})`}>
          {documents.length === 0 ? (
            <DetailField label="Uploaded documents" wide>{null}</DetailField>
          ) : (
            <div className="col-span-full space-y-2">
              {documents.map((doc, i) => {
                const url = doc.cloudinaryUrl || doc.path;
                return (
                  <div
                    key={doc._id || doc.publicId || i}
                    className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
                  >
                    <DocumentTextIcon className="h-6 w-6 shrink-0 text-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-fg">
                        {doc.originalName || doc.filename || 'Document'}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {[DOC_TYPE_LABEL[doc.documentType], formatDate(doc.uploadedAt), doc.description]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost shrink-0"
                        aria-label="Open document"
                      >
                        <ArrowTopRightOnSquareIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </DetailSection>
      )}

      <DetailSection title="Account" cols={5}>
        <DetailField label="Sign-in Method">{signInMethod(user)}</DetailField>
        <DetailField label="Joined">{formatDate(user.createdAt, true)}</DetailField>
        <DetailField label="Last Login">{formatDate(user.lastLogin, true) || 'Never'}</DetailField>
        <DetailField label="Last Updated">{formatDate(user.updatedAt, true)}</DetailField>
        <DetailField label="User ID">
          <span className="select-all font-mono text-xs font-normal">{user._id}</span>
        </DetailField>
      </DetailSection>
    </>
  );
};

export default UserDetails;
