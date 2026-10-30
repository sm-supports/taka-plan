/** Rates admin page: login, the rates table, draft/publish, preview, change log. */
export const admin = {
  title: "Rates admin",
  login: {
    title: "Rates admin sign-in",
    password: "Password",
    submit: "Sign in",
    failed: "Wrong password.",
    signOut: "Sign out",
  },

  table: {
    key: "Key",
    label: "Label",
    value: "Value",
    unit: "Unit",
    range: "Range",
    asOf: "As of",
    nextReview: "Next review",
    source: "Source",
    sourceUrl: "Source URL",
    reviewedBy: "Reviewed by",
    note: "Note",
    ourAssumption: "Our assumption",
    stale: "Past review date",
    empty: "No rows yet.",
  },

  action: {
    edit: "Edit",
    save: "Save row",
    cancel: "Cancel",
    publish: "Publish draft v{version}",
    discard: "Discard draft",
    previewFirst: "Preview first",
    preview: "Preview",
    newDraft: "Start a draft",
  },

  state: {
    published: "Published v{version}",
    draft: "Draft v{version}",
    noDraft: "No draft. Edit a row to start one.",
    unsaved: "Unsaved changes",
    saved: "Saved",
    publishedAt: "Published {date}",
  },

  preview: {
    title: "Preview: how three sample plans change",
    profile: {
      first_job: "First job",
      freelancer: "Freelancer",
      family_with_debt: "Family with debt",
    },
    published: "Published",
    draft: "Draft",
    changed: "Changed",
    unchanged: "No change",
    monthlyTotal: "Monthly amount",
    bucket: "Bucket",
    before: "Before",
    after: "After",
  },

  changeLog: {
    title: "Change log",
    version: "Version",
    when: "When",
    who: "By",
    key: "Key",
    from: "From",
    to: "To",
    note: "Note",
    empty: "No changes yet.",
  },

  validation: {
    number: "Enter a number.",
    date: "Enter a date as YYYY-MM-DD.",
    url: "Enter a full URL.",
    required: "This field is required.",
    reviewBeforeAsOf: "Next review must be after the as-of date.",
  },
} as const;
