/**
 * Shared Tailwind class bundles — admin backoffice + public forms.
 * Slate / violet palette, consistent spacing & focus rings.
 */

export const formLabelClass = "block text-sm font-semibold text-slate-700";

export const formInputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20";

export const formInputMonoClass = `${formInputClass} font-mono text-[13px]`;

export const formTextareaClass = `${formInputClass} min-h-[5rem] resize-y`;

export const formHintClass = "mt-1.5 text-xs leading-relaxed text-slate-500";

/** Softer background until focus — login, etc. */
export const formLoginInputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-500/20";

export const formPageCardClass =
  "rounded-2xl border border-slate-200/90 bg-white p-5 shadow-md shadow-slate-200/40 ring-1 ring-slate-100/80 sm:p-6 sm:p-8";

/** Edit / highlight variant */
export const formPageCardHighlightClass =
  "rounded-2xl border border-violet-200/80 bg-gradient-to-br from-white via-violet-50/30 to-fuchsia-50/20 p-5 shadow-md shadow-violet-500/10 ring-1 ring-violet-100/60 sm:p-6 sm:p-8";

export const formPageTitleClass = "text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.75rem]";
export const formPageDescClass = "mt-1.5 text-sm leading-relaxed text-slate-600";

export const formStackClass = "mt-8 space-y-6";
export const formStackTightClass = "mt-8 space-y-5";
export const formInnerStackClass = "space-y-6";

export const formPrimaryButtonClass =
  "inline-flex h-12 min-h-[2.75rem] items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-50 sm:h-11 sm:min-h-0";

export const formSecondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-violet-200 hover:bg-violet-50/50";

export const formDarkButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 disabled:pointer-events-none disabled:opacity-50";

export const formDangerGradientButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition hover:brightness-105 disabled:pointer-events-none disabled:opacity-50";

export const formSectionTitleClass = "text-xs font-bold uppercase tracking-wider text-slate-500";

export const formSectionBoxClass =
  "space-y-4 rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 ring-1 ring-slate-100/80";

export const formNestedPanelClass =
  "space-y-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm";

export const formCheckboxGroupClass =
  "space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 ring-1 ring-slate-100/80";

export const formRadioCardClass =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 shadow-sm transition has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50/80 has-[:checked]:ring-1 has-[:checked]:ring-violet-200/60";

export const formActionsRowClass = "flex flex-wrap gap-3 border-t border-slate-100 pt-6";

export const formActionsRowCompactClass = "flex flex-wrap gap-3 pt-2";

export const formErrorBoxClass =
  "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800";

export const formSuccessBoxClass =
  "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900";

export const formFileInputClass = `${formInputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-violet-800`;

/** Modal shell (public comment, etc.) */
export const formDialogPanelClass =
  "relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-300/50 ring-1 ring-slate-100";
