# Virtual Try-On App MVP Spec

Status: Draft v0.1  
Owner: TBD  
Last updated: 2026-05-01

## 1. Product Summary

The app lets a user upload 1-3 full-body photos, share or submit clothing they find online, and receive an AI-generated try-on image showing how the garment may look on them.

The MVP should prove that users can:

- Create an account or session
- Upload body photos
- Submit a clothing item through a URL, screenshot, or share extension
- Start an async try-on job
- See processing status
- Receive a completed try-on image
- Optionally receive a push notification when processing completes

## 2. Primary User Flow

1. User installs and opens the mobile app.
2. User signs in or continues with a lightweight account/session.
3. User uploads 1-3 full-body photos.
4. App stores photos securely in S3 using pre-signed upload URLs.
5. User finds clothing online.
6. User submits clothing using one of three inputs:
   - Share to app from browser or shopping app
   - Paste product URL
   - Upload screenshot
7. Backend creates a try-on job and places it in an async queue.
8. Worker extracts product/garment data.
9. Worker sends user image and garment input to a virtual try-on / GenAI API.
10. Generated result is saved to S3 and linked in the database.
11. App shows the result.
12. App optionally sends a push notification when the job completes.

## 3. MVP Feature List

### Must Have

- React Native mobile app
- Upload 1-3 full-body user photos
- Paste product URL
- Upload clothing screenshot
- Create try-on job
- Show job status: pending, processing, completed, failed
- Show generated try-on result
- Store original uploads and generated images in S3
- Store user, photo, product, and job metadata in Postgres
- Basic authentication
- Basic privacy controls and image deletion

### Should Have

- iOS Share Extension using Swift
- Push notification on job completion
- Product URL extraction cache
- Result gallery/history
- Basic job retry on worker failure
- Admin dashboard for reviewing jobs and failures

### Later

- Android share extension
- Multiple generated variations per garment
- Outfit combinations
- Saved wardrobe
- Recommendations
- Payments/subscriptions
- Social sharing
- In-house ML model
- Kubernetes/EKS deployment

## 4. Recommended Tech Stack

### Client

- React Native + TypeScript
- HeroUI Native for mobile UI
- Swift / SwiftUI for iOS Share Extension
- Expo Push Notifications for MVP, or direct APNs/FCM later
- Local mobile cache for thumbnails and recent results

### Backend

- Node.js with NestJS or Fastify
- REST API for MVP
- Optional GraphQL later if app screens become highly data-driven

### Database

Recommended MVP choice: Supabase Postgres.

Reasons:

- Free tier is good for MVP
- Real Postgres
- Fast to build with
- Can support auth if desired
- Easier than managing AWS RDS on day one

Alternative:

- AWS RDS Postgres if the product must be fully AWS-native from the start
- Neon Postgres if only a hosted Postgres database is needed

### AWS Services

- S3 Raw Images Bucket: user body photos, screenshots, source inputs
- S3 Results Bucket: generated try-on images
- CloudFront: CDN in front of generated images and thumbnails
- SQS: async try-on job queue
- Lambda: MVP worker runtime
- ECS/Fargate: later worker runtime if image jobs are too long for Lambda
- ElastiCache Redis or Upstash Redis: caching and rate limiting
- Amplify Hosting: only for web/admin dashboard, not for hosting the mobile app

### AI / Image Processing

- Third-party virtual try-on or GenAI image API for MVP
- Garment extraction / segmentation service or model
- Product scraper or screenshot parser
- Avoid training an in-house model during MVP

## 5. Initial System Design

![Virtual Try-On App System Design](./assets/virtual-try-on-system-design.png)

### High-Level Architecture

```text
React Native App
  -> Node.js Backend API
  -> Postgres Database
  -> S3 Raw Image Uploads
  -> SQS Try-On Job Queue
  -> Lambda/ECS Worker
  -> Garment Extraction + GenAI Try-On API
  -> S3 Result Images
  -> CloudFront CDN
  -> App Result Screen
  -> Push Notification
```

## 6. Service Connections

### Mobile App to Backend API

- Mobile app communicates with the Node.js API over HTTPS.
- Backend authenticates user requests.
- Backend creates pre-signed S3 upload URLs.
- Backend creates try-on jobs.
- Backend returns job status and result metadata.

### Mobile App to S3

- App should upload images directly to S3 using pre-signed URLs.
- This avoids sending large image files through the backend API.
- Backend stores only metadata and object keys in Postgres.

### Backend API to Postgres

Stores:

- Users
- User photos
- Product submissions
- Try-on jobs
- Result image metadata
- Push notification device tokens
- Basic audit records

### Backend API to SQS

- When a try-on job is created, the backend writes a message to SQS.
- The message contains job ID and references to stored image/product inputs.
- Large image files are never sent through SQS.

### SQS to Worker

- Worker consumes jobs from SQS.
- Worker updates job status in Postgres and Redis.
- Worker fetches source assets from S3.
- Worker calls product extraction, garment extraction, and try-on generation services.
- Worker saves completed output to S3 Results Bucket.

### S3 Results to CloudFront

- Result images and thumbnails are served through CloudFront.
- The app receives CloudFront URLs rather than raw S3 URLs.

### Worker to Push Notifications

- On job completion or failure, worker triggers a push notification.
- MVP can use Expo Push.
- Later, use direct APNs/FCM if more control is needed.

## 7. Caching Design

### MVP Caching

- Mobile local cache for thumbnails and recent result images
- CloudFront cache for result images
- Database status polling for jobs

### Add Redis When Needed

Use Redis for:

- Job status cache
- Rate limiting
- Product URL extraction cache
- Duplicate URL detection
- Short-lived session or upload state
- Worker progress updates

Do not add Redis on day one unless the API needs rate limiting immediately.

## 8. Initial Data Model

### users

- id
- email / auth_provider_id
- display_name
- created_at
- updated_at

### user_photos

- id
- user_id
- s3_bucket
- s3_key
- image_type: full_body
- status: uploaded, rejected, deleted
- created_at

### product_inputs

- id
- user_id
- input_type: url, screenshot, share_extension
- source_url
- screenshot_s3_key
- extracted_title
- extracted_brand
- extracted_price
- extracted_image_url
- extraction_status
- created_at

### try_on_jobs

- id
- user_id
- user_photo_id
- product_input_id
- status: pending, queued, processing, completed, failed
- failure_reason
- started_at
- completed_at
- created_at

### try_on_results

- id
- job_id
- user_id
- result_s3_key
- thumbnail_s3_key
- model_provider
- created_at

### push_tokens

- id
- user_id
- platform: ios, android
- token
- enabled
- created_at
- updated_at

## 9. Initial API Surface

### Auth

- `POST /auth/sign-up`
- `POST /auth/sign-in`
- `POST /auth/sign-out`
- `GET /me`

Exact endpoints may change if using Supabase Auth or Cognito directly.

### Uploads

- `POST /uploads/photo-url`
- `POST /uploads/screenshot-url`
- `POST /uploads/complete`

### Product Inputs

- `POST /product-inputs/url`
- `POST /product-inputs/screenshot`
- `GET /product-inputs/:id`

### Try-On Jobs

- `POST /try-on-jobs`
- `GET /try-on-jobs/:id`
- `GET /try-on-jobs`
- `POST /try-on-jobs/:id/cancel`

### Results

- `GET /results`
- `GET /results/:id`
- `DELETE /results/:id`

### Push Notifications

- `POST /push-tokens`
- `DELETE /push-tokens/:id`

## 10. MVP Development Phases

### Phase 1: Foundation

- Mobile app shell
- Auth
- User photo upload to S3
- Postgres schema
- Backend API setup

### Phase 2: Try-On Job Flow

- Product URL input
- Screenshot upload
- Job creation
- SQS queue
- Worker skeleton
- Job status screen

### Phase 3: AI Integration

- Product extraction
- Garment extraction
- Virtual try-on API integration
- Save result image
- Result screen

### Phase 4: Polish

- Push notifications
- Result gallery
- Error states
- Retry handling
- Basic admin dashboard

### Phase 5: Scale Later

- Redis
- ECS/Fargate workers
- More advanced observability
- Payments
- Multiple try-on generations
- Android share support

## 11. Key Risks

- Try-on quality may vary heavily by AI provider.
- Product pages may block scraping or have inconsistent HTML.
- User-uploaded body photos are sensitive personal data.
- Image generation can be slow and expensive.
- Lambda may not be enough if generation jobs run too long.
- App store review may require clear privacy and data deletion policies.

## 12. Open Questions

### Product and User Flow

1. Who is the first target user: everyday shoppers, fashion creators, stylists, or ecommerce buyers?
2. Is the MVP mobile-only, or do you also need a web/admin dashboard immediately?
3. Should users be required to create an account before uploading photos?
4. Should users upload exactly one full-body photo first, or allow 1-3 from the beginning?
5. Should the app keep a permanent result history, or should generated images expire?
6. Do users need to compare multiple try-on results side by side?
7. Do users need to save favorite clothing items before generating?

### Input Sources

8. For MVP, should product URL input come first, screenshot upload first, or both?
9. Is the iOS Share Extension required in the first MVP release, or can it come after paste URL?
10. Do you need Android support in the first MVP?
11. Should the app support any ecommerce site, or only a small list of supported stores at first?

### AI and Image Generation

12. Do you already have a GenAI / virtual try-on API provider in mind?
13. Is realism more important, or speed/cost?
14. Should the result preserve the user's face, or crop/blur the face for privacy?
15. Should outputs be full-body only, or support upper-body/lower-body garments separately?
16. How many try-on images should one job generate: one result or multiple options?

### Privacy and Compliance

17. How long should raw user photos be stored?
18. Should users be able to delete all photos and generated results from the app?
19. Are you planning to launch only in one country first?
20. Do you need parental age restrictions or adult-content filtering?

### Business Model

21. Will the MVP be free, paid, credits-based, or subscription-based?
22. Should users get a limited number of free generations?
23. Do you need affiliate links or ecommerce checkout integration later?

### Technical Decisions

24. Do you prefer Supabase Auth or AWS Cognito?
25. Do you prefer Supabase Postgres for speed, or AWS RDS Postgres for AWS consistency?
26. Do you want to use Expo for React Native, or bare React Native?
27. Do you want NestJS or Fastify for the backend?
28. Should we deploy the backend first on AWS Lambda, ECS/Fargate, or a simpler platform for MVP?
29. Do you want the admin dashboard in the MVP?
30. What is your target timeline for the first working MVP?

## 13. Current Recommendation

Build the MVP with:

- React Native + TypeScript
- HeroUI Native
- Expo if it does not block the iOS Share Extension workflow
- Swift iOS Share Extension
- Node.js Fastify or NestJS API
- Supabase Auth + Supabase Postgres
- AWS S3 for uploads and results
- AWS CloudFront for image delivery
- AWS SQS for async jobs
- AWS Lambda worker first
- Third-party virtual try-on API
- Expo Push Notifications

Avoid EKS/Kubernetes until the product has real users, repeated job volume, and infrastructure pain that justifies it.
