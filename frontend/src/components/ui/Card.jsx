/**
 * Card Component - Serviqo Design System
 *
 * A versatile container component with optional header, body, and footer sections.
 * Supports hover effects for interactive cards.
 *
 * Usage:
 *   <Card>
 *     <Card.Header>Title</Card.Header>
 *     <Card.Body>Content here</Card.Body>
 *     <Card.Footer>Footer content</Card.Footer>
 *   </Card>
 *
 *   <Card interactive>
 *     Interactive card with hover effect
 *   </Card>
 */

import React from 'react';

const Card = React.forwardRef(
  (
    {
      children,
      interactive = false,
      padding = true,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={`
          bg-surface border border-border rounded-xl
          ${interactive ? 'hover:shadow-lg hover:border-border-strong hover:-translate-y-0.5 transition-all cursor-pointer' : 'shadow-sm'}
          ${padding ? 'p-6' : ''}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Card.Header - Header section with title and optional actions
 */
const CardHeader = ({ children, action, className = '', ...props }) => (
  <div
    className={`
      pb-4 border-b border-border flex items-center justify-between
      ${className}
    `.trim()}
    {...props}
  >
    <div className="flex-1">{children}</div>
    {action && <div className="ml-4 flex-shrink-0">{action}</div>}
  </div>
);

CardHeader.displayName = 'Card.Header';

/**
 * Card.Body - Main content section
 */
const CardBody = ({ children, className = '', ...props }) => (
  <div
    className={`
      py-4
      ${className}
    `.trim()}
    {...props}
  >
    {children}
  </div>
);

CardBody.displayName = 'Card.Body';

/**
 * Card.Footer - Footer section, typically for actions
 */
const CardFooter = ({ children, className = '', align = 'end', ...props }) => (
  <div
    className={`
      pt-4 border-t border-border
      flex gap-3 ${align === 'end' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}
      ${className}
    `.trim()}
    {...props}
  >
    {children}
  </div>
);

CardFooter.displayName = 'Card.Footer';

// Attach sub-components
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;

/**
 * Specialized Card Variants
 */

// Job/Service Card
export const JobCard = ({
  title,
  status,
  postedTime,
  category,
  description,
  tags = [],
  onViewDetails,
  className = '',
}) => (
  <Card interactive className={className}>
    {/* Header with Title and Status Badge */}
    <div className="flex items-start justify-between mb-3">
      <h3 className="text-h3 text-text-primary flex-1">{title}</h3>
      {status && (
        <span className={`
          px-2 py-1 text-caption font-semibold rounded-md ml-3 flex-shrink-0
          ${status === 'Active' ? 'bg-accent-subtle text-accent' : 'bg-warning-light text-warning'}
        `}>
          {status}
        </span>
      )}
    </div>

    {/* Meta Information */}
    <div className="flex flex-wrap gap-4 mb-3 text-body-sm text-text-secondary">
      {postedTime && <span>⏰ {postedTime}</span>}
      {category && <span>📁 {category}</span>}
    </div>

    {/* Description */}
    <p className="text-body-sm text-text-secondary mb-3 line-clamp-2">
      {description}
    </p>

    {/* Tags */}
    {tags.length > 0 && (
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 text-caption bg-primary-subtle text-text-brand rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    )}

    {/* Action */}
    {onViewDetails && (
      <button
        onClick={onViewDetails}
        className="text-primary font-semibold text-sm hover:text-primary-hover flex items-center gap-1"
      >
        View Details →
      </button>
    )}
  </Card>
);

// Professional Card
export const ProfessionalCard = ({
  name,
  role,
  avatar,
  verified = false,
  rating,
  jobsCompleted,
  bio,
  onViewProposal,
  className = '',
}) => (
  <Card className={className}>
    {/* Avatar + Info */}
    <div className="flex items-start gap-4 mb-4">
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-text-inverse text-lg font-bold flex-shrink-0">
        {avatar || name.charAt(0)}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-h3 text-text-primary">{name}</h4>
          {verified && (
            <span className="px-2 py-0.5 text-caption font-semibold bg-success text-text-inverse rounded">
              ✓ Verified
            </span>
          )}
        </div>
        <p className="text-body-sm text-text-secondary">{role}</p>
      </div>
    </div>

    {/* Stats */}
    {(rating || jobsCompleted) && (
      <div className="flex gap-4 mb-4 text-body-sm text-text-secondary">
        {rating && <span>⭐ {rating}</span>}
        {jobsCompleted && <span>💼 {jobsCompleted}+ jobs</span>}
      </div>
    )}

    {/* Bio */}
    {bio && (
      <p className="text-body-sm text-text-secondary mb-4 line-clamp-2">
        {bio}
      </p>
    )}

    {/* Action */}
    {onViewProposal && (
      <button
        onClick={onViewProposal}
        className="w-full px-4 py-2 bg-primary text-text-inverse font-semibold rounded-lg hover:bg-primary-hover transition-colors text-sm"
      >
        View Proposal
      </button>
    )}
  </Card>
);

// Stat Card
export const StatCard = ({
  number,
  label,
  icon: Icon,
  trend,
  trendLabel,
  className = '',
}) => (
  <Card className={className}>
    <div className="flex items-start justify-between">
      <div>
        <div className="text-4xl font-bold text-primary mb-2">
          {number}
        </div>
        <p className="text-body-sm text-text-secondary">{label}</p>
        {trend && trendLabel && (
          <p className={`text-caption mt-2 ${trend === 'up' ? 'text-success' : 'text-error'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendLabel}
          </p>
        )}
      </div>
      {Icon && (
        <div className="text-text-tertiary flex-shrink-0">
          <Icon size={28} />
        </div>
      )}
    </div>
  </Card>
);
