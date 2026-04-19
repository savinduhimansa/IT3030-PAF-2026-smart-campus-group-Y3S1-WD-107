function EnvelopeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M4 6.75C4 5.784 4.784 5 5.75 5h12.5C19.216 5 20 5.784 20 6.75v10.5c0 .966-.784 1.75-1.75 1.75H5.75C4.784 19 4 18.216 4 17.25V6.75Zm2.02-.25a.75.75 0 0 0-.456 1.346l6.02 3.86a.75.75 0 0 0 .812 0l6.04-3.86A.75.75 0 0 0 17.98 6.5H6.02Zm12.48 2.932-5.7 3.646a2.25 2.25 0 0 1-2.42 0L5.5 9.43v7.82c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25V9.432Z"
      />
    </svg>
  )
}

function PhoneIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M7.4 3.75c.54 0 1.03.31 1.25.8l1.1 2.45c.2.45.14.97-.16 1.36l-1.03 1.36a.75.75 0 0 0-.05.83c1.05 1.85 2.5 3.3 4.35 4.35.28.16.63.14.86-.06l1.33-1.02c.4-.3.92-.36 1.38-.15l2.42 1.08c.5.22.82.72.82 1.26v1.7c0 .86-.6 1.61-1.44 1.78-1.54.32-2.93.26-4.52-.2-3.23-.94-6.09-3.78-7.04-7.01-.48-1.6-.55-3-.23-4.56.17-.84.92-1.44 1.79-1.44H7.4Zm.1 1.5H6.25c-.15 0-.28.1-.31.25-.25 1.22-.2 2.3.16 3.5.83 2.83 3.36 5.35 6.2 6.18 1.18.35 2.25.4 3.45.15.15-.03.25-.16.25-.31v-1.23l-1.98-.88-1.08.83a2.23 2.23 0 0 1-2.53.18c-2.1-1.2-3.77-2.87-4.96-4.97a2.22 2.22 0 0 1 .18-2.47l.84-1.1L7.5 5.25Z"
      />
    </svg>
  )
}

function MapPinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M12 2.75c-3.73 0-6.75 3.03-6.75 6.76 0 4.42 5.05 10.35 6.23 11.69.28.32.77.32 1.05 0 1.17-1.34 6.22-7.27 6.22-11.69 0-3.73-3.02-6.76-6.75-6.76Zm0 1.5a5.25 5.25 0 0 1 5.25 5.26c0 1.54-.83 3.72-2.36 6.31A32.65 32.65 0 0 1 12 19.86a32.69 32.69 0 0 1-2.89-4.04c-1.53-2.59-2.36-4.77-2.36-6.31A5.25 5.25 0 0 1 12 4.25Zm0 2.5a2.76 2.76 0 1 0 0 5.51 2.76 2.76 0 0 0 0-5.51Zm0 1.5a1.26 1.26 0 1 1 0 2.51 1.26 1.26 0 0 1 0-2.51Z"
      />
    </svg>
  )
}

export default function ContactSection() {
  const directionsUrl =
    'https://www.google.com/maps?q=6.9147,79.9724&z=16' // SLIIT Malabe

  return (
    <section
      id="contact-us"
      className="w-full bg-white py-20 px-5"
      aria-labelledby="contact-us-heading"
      style={{ fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif' }}
    >
      <div className="text-center mb-10">
        <div className="inline-flex flex-col items-center">
          <h2
            id="contact-us-heading"
            className="m-0 text-[32px] font-bold text-slate-900 tracking-[-0.02em]"
          >
            Contact Us
          </h2>
          <div className="w-10 h-[3px] bg-indigo-600 rounded-full mt-2.5" />
        </div>

        <p className="mt-1 text-[16px] leading-relaxed text-slate-500">
          We&apos;re here to help. Reach out to us through any of the channels
          below.
        </p>
      </div>

      <div className="max-w-[900px] mx-auto flex flex-wrap justify-center gap-6">
        <div className="flex-1 basis-[260px] max-w-[280px] bg-white rounded-xl px-6 py-8 text-center border-t-4 border-indigo-600 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
            <EnvelopeIcon className="w-[22px] h-[22px] text-indigo-600" />
          </div>
          <div className="text-[16px] font-bold text-slate-900 mb-3.5">Email Us</div>

          <div className="text-[12px] text-slate-500 mb-1.5">General Inquiries</div>
          <a
            className="inline-block text-[14px] text-indigo-600 no-underline hover:underline"
            href="mailto:info@smartcampus.edu.lk"
          >
            info@smartcampus.edu.lk
          </a>

          <div className="text-[12px] text-slate-500 mb-1.5 mt-3">Support</div>
          <a
            className="inline-block text-[14px] text-indigo-600 no-underline hover:underline"
            href="mailto:support@smartcampus.edu.lk"
          >
            support@smartcampus.edu.lk
          </a>
        </div>

        <div className="flex-1 basis-[260px] max-w-[280px] bg-white rounded-xl px-6 py-8 text-center border-t-4 border-indigo-600 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
            <PhoneIcon className="w-[22px] h-[22px] text-indigo-600" />
          </div>
          <div className="text-[16px] font-bold text-slate-900 mb-3.5">Call Us</div>

          <div className="text-[12px] text-slate-500 mb-1.5">Main Office</div>
          <div className="text-[14px] font-bold text-slate-900">+94 11 234 5678</div>

          <div className="text-[12px] text-slate-500 mb-1.5 mt-3">Support Hotline</div>
          <div className="text-[14px] font-bold text-slate-900">+94 11 234 5679</div>

          <div className="text-[11px] text-slate-500 mt-2.5">
            Mon – Fri, 8:00 AM – 5:00 PM
          </div>
        </div>

        <div className="flex-1 basis-[260px] max-w-[280px] bg-white rounded-xl px-6 py-8 text-center border-t-4 border-indigo-600 shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-transform duration-200 hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-indigo-50 inline-flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="w-[22px] h-[22px] text-indigo-600" />
          </div>
          <div className="text-[16px] font-bold text-slate-900 mb-3.5">Visit Us</div>

          <div className="text-[13px] font-semibold text-slate-900 leading-snug">
            Sri Lanka Institute of Information Technology
          </div>
          <div className="text-[13px] text-slate-500 leading-snug mt-1.5">
            New Kandy Road, Malabe
          </div>
          <div className="text-[13px] text-slate-500 leading-snug mt-1.5">
            Colombo, Sri Lanka
          </div>

          <a
            className="inline-block text-[13px] font-semibold text-indigo-600 no-underline hover:underline mt-3"
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions →
          </a>
        </div>
      </div>
    </section>
  )
}
