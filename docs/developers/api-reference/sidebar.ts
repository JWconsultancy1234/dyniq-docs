import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "developers/api-reference/dyniq-agents-api",
    },
    {
      type: "category",
      label: "leads",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/process-lead-endpoint-api-process-lead-post",
          label: "Process Lead Endpoint",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "content",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/create-content-api-content-create-post",
          label: "Create Content",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "hitl",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/resume-review-api-hitl-resume-post",
          label: "Resume Review",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/list-pending-api-hitl-pending-get",
          label: "List Pending",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "board-meeting",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/analyze-board-meeting-api-board-meeting-analyze-post",
          label: "Analyze Board Meeting",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/resume-board-meeting-api-board-meeting-resume-post",
          label: "Resume Board Meeting",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/get-meeting-status-api-board-meeting-status-thread-id-get",
          label: "Get Meeting Status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/get-agent-calibration-api-board-meeting-agent-calibration-agent-name-get",
          label: "Get Agent Calibration",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/get-calibration-report-api-board-meeting-calibration-report-get",
          label: "Get Calibration Report",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/record-t-7-feedback-api-board-meeting-feedback-t-7-post",
          label: "Record T7 Feedback",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/record-t-30-outcome-api-board-meeting-feedback-t-30-post",
          label: "Record T30 Outcome",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/get-pending-feedback-api-board-meeting-pending-feedback-get",
          label: "Get Pending Feedback",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/send-feedback-reminder-api-board-meeting-send-reminder-thread-id-post",
          label: "Send Feedback Reminder",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/pre-call-intelligence-api-board-meeting-pre-call-post",
          label: "Pre Call Intelligence",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/evaluate-meeting-api-board-meeting-evaluate-thread-id-post",
          label: "Evaluate Meeting",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "vector",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/search-similar-items-api-vector-search-post",
          label: "Search Similar Items",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "vision",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/ui-to-code-api-vision-ui-to-code-post",
          label: "Ui To Code",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/get-status-api-vision-status-thread-id-get",
          label: "Get Status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/submit-feedback-api-vision-feedback-post",
          label: "Submit Feedback",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "style-transfer",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/extract-from-url-api-style-transfer-extract-post",
          label: "Extract From Url",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/manual-input-api-style-transfer-manual-post",
          label: "Manual Input",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/prepare-for-analysis-api-style-transfer-prepare-extraction-id-get",
          label: "Prepare For Analysis",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/analyze-style-api-style-transfer-analyze-post",
          label: "Analyze Style",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/get-analysis-status-api-style-transfer-status-thread-id-get",
          label: "Get Analysis Status",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/generate-images-api-style-transfer-generate-post",
          label: "Generate Images",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/run-full-pipeline-api-style-transfer-full-pipeline-post",
          label: "Run Full Pipeline",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "developers/api-reference/download-brand-kit-pdf-api-style-transfer-thread-id-pdf-get",
          label: "Download Brand Kit Pdf",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "UNTAGGED",
      items: [
        {
          type: "doc",
          id: "developers/api-reference/health-check-health-get",
          label: "Health Check",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/health-check-detailed-health-ready-get",
          label: "Health Check Detailed",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/timeout-stats-health-timeouts-get",
          label: "Timeout Stats",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "developers/api-reference/root-get",
          label: "Root",
          className: "api-method get",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
