function Brand() {
  return (
    <span
      className="brand-mark"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.7rem',
        color: '#FFFFFF',
      }}
    >
      <span
        className="brand-icon"
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0EA5A8',
          color: '#FFFFFF',
          fontSize: '1.1rem',
        }}
      >
        ⚖️
      </span>

      <span className="d-flex flex-column">
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: '0.98rem',
            lineHeight: '1.2',
          }}
        >
          AI Legal Document Analyzer
        </span>

        <span
          className="brand-subtitle d-none d-md-inline"
          style={{
            color: '#B8D0D5',
            fontSize: '0.7rem',
            marginTop: '2px',
          }}
        >
          AI-Powered Contract Intelligence
        </span>
      </span>
    </span>
  );
}

export default Brand;