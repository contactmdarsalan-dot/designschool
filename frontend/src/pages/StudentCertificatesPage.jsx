import { motion } from 'framer-motion';
import { Download, ShieldCheck } from 'lucide-react';

import {
  EmptyWorkspaceState,
  MetricTile,
  StatusBadge,
  WorkspaceError,
  WorkspaceLoading,
  WorkspacePanel,
} from '../components/student/StudentWorkspaceUi';
import { useStudentWorkspaceResource } from '../hooks/useStudentWorkspaceResource';
import { formatDate } from '../lib/studentWorkspace';
import { pageTransition } from '../lib/studentWorkspaceMotion';

const StudentCertificatesPage = () => {
  const { data, isLoading, error } = useStudentWorkspaceResource(
    'students/certificates/',
    {
      summary: {},
      certificates: [],
    },
    'Unable to load your certificates.',
  );

  if (isLoading) {
    return <WorkspaceLoading label="Loading certificates..." />;
  }

  return (
    <motion.div variants={pageTransition} initial="hidden" animate="show" className="space-y-6">
      {error ? <WorkspaceError message={error} /> : null}

      <WorkspacePanel eyebrow="Certificates" title="Certificates & Completion" description="Issued and downloadable.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <MetricTile label="Total" value={data.summary.total || 0} hint="Certificates on record" />
          <MetricTile label="Issued" value={data.summary.issued || 0} hint="Ready to use" tone="accent" />
          <MetricTile label="Pending" value={data.summary.pending || 0} hint="Awaiting issue" />
          <MetricTile label="Downloadable" value={data.summary.downloadable || 0} hint="Files available now" />
        </div>
      </WorkspacePanel>

      <WorkspacePanel eyebrow="Credentials" title="Certificate Library">
        {data.certificates.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {data.certificates.map((certificate) => (
              <div key={certificate.id} className="rounded-[1.15rem] border border-[#e5ebf5] bg-[#fbfcfe] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[#22324d]">{certificate.title}</p>
                    <p className="mt-1 text-sm text-[#7e8ba3]">{certificate.course_title}</p>
                  </div>
                  <StatusBadge value={certificate.status_label} tone={certificate.status === 'issued' ? 'success' : 'neutral'} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#e5ebf5] bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Issued On</p>
                    <p className="mt-2 text-base font-medium text-[#22324d]">{formatDate(certificate.issued_on)}</p>
                  </div>
                  <div className="rounded-xl border border-[#e5ebf5] bg-white px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#9aa8bd]">Certificate ID</p>
                    <p className="mt-2 text-base font-medium text-[#22324d]">{certificate.unique_id}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {certificate.download_link ? (
                    <a
                      href={certificate.download_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-[#e5ebf5] bg-white px-4 py-2.5 text-sm text-[#6d7f99]">
                      <ShieldCheck className="h-4 w-4" />
                      Download not available yet
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyWorkspaceState
            title="No certificates issued yet"
            description="Issued certificates appear here."
          />
        )}
      </WorkspacePanel>
    </motion.div>
  );
};

export default StudentCertificatesPage;
