# 🚀 Trip Mate AI — AWS Migration Plan

> **Purpose:** Learn AWS by incrementally migrating Trip Mate AI from Firebase/Vercel.  
> **Approach:** One service at a time. Keep Firebase running alongside. No downtime.  
> **Created:** March 19, 2026

---

## 📊 Current → Target Architecture

```
CURRENT                              TARGET (AWS)
───────────────────────              ───────────────────────
Vercel Hosting          ──────►      AWS Amplify Hosting
Firebase Auth (Google)  ──────►      Amazon Cognito
Firestore (trip-mate-ai)──────►      DynamoDB
Firebase Storage        ──────►      S3 + CloudFront
Gemini API Key          ──────►      ✅ DONE (Vertex AI)
Vercel Analytics        ──────►      CloudWatch RUM
```

---

## 🗓️ Migration Steps (in order)

### Step 0: CDK Infrastructure Setup ⭐ Easy
**Goal:** Set up infrastructure as code foundation  
**Estimated time:** 1 hour  
**Risk:** Low — just tooling setup

#### What to do
- [ ] Install AWS CDK CLI (`npm install -g aws-cdk`)
- [ ] Initialize CDK app in project root (`cdk init app --language typescript`)
- [ ] Configure AWS CLI with your existing account credentials
- [ ] Create basic CDK stack structure for future resources
- [ ] Set up billing alerts at $5 and $10 in AWS Console

#### Files to change
- `cdk.json` (generated)
- `lib/cdk-stack.ts` (new)
- `package.json` — Add CDK dependencies

#### AWS services to learn
- **AWS CDK** — Infrastructure as code
- **AWS CLI** — Command-line access to AWS

#### Verify
- [ ] `cdk bootstrap` runs successfully
- [ ] `cdk synth` generates CloudFormation template
- [ ] Billing alerts configured

---

### Step 1: Deploy to AWS Amplify Hosting ⭐ Easy
**Goal:** Learn CI/CD, CloudWatch, IAM basics  
**Estimated time:** 1-2 hours  
**Risk:** Low — just adding a second deployment target

#### What to do
- [ ] Create Amplify app via CLI or Console
- [ ] Connect GitHub repo (`main` branch)
- [ ] Configure build settings for Next.js 16 (SSR)
- [ ] Set environment variables (Firebase + Vertex AI credentials)
- [ ] Handle `GOOGLE_CREDENTIALS_JSON` env var (vertex-ai-client.json as string)
- [ ] Verify all features work on `*.amplifyapp.com`
- [ ] Set up CloudWatch log monitoring

#### Files to change
- `lib/vertexai.ts` — ✅ Already supports `GOOGLE_CREDENTIALS_JSON` env var
- Remove `@vercel/analytics` and `@vercel/speed-insights` (or make conditional)

#### AWS services to learn
- **Amplify Hosting** — Managed CI/CD for web apps
- **IAM** — Permissions and roles
- **CloudWatch** — Logs and monitoring

#### Verify
- [ ] App loads on Amplify domain
- [ ] Auth works (Google Sign-in)
- [ ] Image upload + AI analysis works
- [ ] Trips CRUD works
- [ ] Real-time updates work

---

### Step 2: Firebase Storage → S3 + CloudFront ⭐⭐ Medium
**Goal:** Learn object storage, CDN, presigned URLs  
**Estimated time:** 3-5 hours  
**Risk:** Medium — need to migrate existing files

#### What to do
- [ ] Create S3 bucket `trip-mate-ai-assets` (region: `us-east-1`)
- [ ] Configure CORS for browser uploads
- [ ] Create CloudFront distribution pointing to S3
- [ ] Implement presigned URL upload flow (server generates URL, client uploads directly)
- [ ] Create `lib/s3Utils.ts` replacing `lib/storageUtils.ts`
- [ ] Update `app/api/upload/route.ts` to use S3
- [ ] Write migration script: download Firebase Storage → upload to S3
- [ ] Update Firestore `imageUrl`/`thumbnailUrl` fields to CloudFront URLs

#### Files to change
- `lib/storageUtils.ts` → `lib/s3Utils.ts` (new)
- `app/api/upload/route.ts` — Rewrite for S3
- `app/api/download/` — Update for CloudFront
- `scripts/migrate-storage-to-s3.ts` (new migration script)

#### AWS services to learn
- **S3** — Object storage, bucket policies, CORS
- **CloudFront** — CDN, cache invalidation
- **IAM Policies** — S3 access control

#### Verify
- [ ] Upload image → stored in S3
- [ ] Images load via CloudFront URL
- [ ] Thumbnails generated correctly
- [ ] Old images migrated and accessible

---

### Step 3: Add Lambda for Thumbnails ⭐⭐ Medium
**Goal:** Learn serverless functions, event-driven architecture  
**Estimated time:** 2-3 hours  
**Risk:** Low — enhances Step 2

#### What to do
- [ ] Create Lambda function `trip-mate-ai-thumbnail-generator`
- [ ] Bundle `sharp` for Lambda (ARM64 layer)
- [ ] Configure S3 event trigger: on new object in `trips/` prefix
- [ ] Lambda generates 400px WebP thumbnail + 16px blur placeholder
- [ ] Store thumbnails back to S3 with `-thumb` suffix
- [ ] Remove thumbnail generation from API route (move to Lambda)

#### Files to change
- `lambda/thumbnail-generator/index.ts` (new)
- `app/api/upload/route.ts` — Remove server-side thumbnail logic

#### AWS services to learn
- **Lambda** — Serverless compute, cold starts, layers
- **S3 Events** — Trigger Lambda on object creation
- **CloudWatch Logs** — Debug Lambda execution

#### Verify
- [ ] Upload image → Lambda auto-generates thumbnail
- [ ] Thumbnail appears in S3 within ~2 seconds
- [ ] Blur placeholder (blurDataUrl) generated correctly

---

### Step 4: Firestore → DynamoDB ⭐⭐⭐ Hard
**Goal:** Learn NoSQL single-table design, GSI, AWS SDK  
**Estimated time:** 5-8 hours  
**Risk:** High — core data layer change

#### What to do
- [ ] Design single-table DynamoDB schema:
  ```
  PK                    SK                    Data
  ────────────────────  ────────────────────  ─────
  USER#<userId>         TRIP#<tripId>         Trip fields
  TRIP#<tripId>         ITEM#<itemId>         TripItem fields
  TRIP#<tripId>         #METADATA             Trip summary/stats
  ```
- [ ] Create GSI: `GSI1` (createdBy → createdAt) for listing user trips
- [ ] Create `lib/dynamoUtils.ts` replacing `lib/firestoreUtils.ts`
- [ ] Update all API routes to use DynamoDB
- [ ] Write data migration script: Firestore → DynamoDB
- [ ] Handle date serialization (Firestore Timestamp → ISO string)

#### Files to change
- `lib/firestoreUtils.ts` → `lib/dynamoUtils.ts` (new)
- `lib/aws.ts` (new — DynamoDB client init)
- `app/api/trips/route.ts` — Use DynamoDB
- `app/api/trips/[tripId]/route.ts` — Use DynamoDB
- `app/api/trips/[tripId]/items/route.ts` — Use DynamoDB
- `app/api/trips/[tripId]/items/[itemId]/route.ts` — Use DynamoDB
- `scripts/migrate-firestore-to-dynamo.ts` (new)

#### AWS services to learn
- **DynamoDB** — Single-table design, partition keys, sort keys
- **GSI** — Secondary indexes for query patterns
- **AWS SDK v3** — `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`

#### Verify
- [ ] All trip CRUD operations work
- [ ] All item CRUD operations work
- [ ] User trip listing returns correct order
- [ ] Data migration script runs without errors
- [ ] Performance comparable to Firestore

---

### Step 5: Firebase Auth → Amazon Cognito ⭐⭐⭐ Hard
**Goal:** Learn OAuth, JWT, user pools  
**Estimated time:** 4-6 hours  
**Risk:** High — auth affects everything

#### What to do
- [ ] Create Cognito User Pool
- [ ] Configure Google as federated identity provider
- [ ] Set up App Client (SPA, no client secret)
- [ ] Install `@aws-amplify/auth` or use Cognito SDK directly
- [ ] Rewrite `lib/authContext.tsx` for Cognito
- [ ] Update `AuthGuard.tsx` component
- [ ] Map Cognito user IDs to existing `createdBy` fields
- [ ] Handle guest mode (unauthenticated identity)

#### Files to change
- `lib/authContext.tsx` — Rewrite for Cognito
- `components/AuthGuard.tsx` — Update auth check
- `lib/firebase.ts` — Remove auth initialization

#### AWS services to learn
- **Cognito User Pools** — User directory, sign-up/sign-in
- **Cognito Identity Pools** — Federated identities, temporary AWS credentials
- **OAuth 2.0 / OIDC** — Token flows, JWT verification

#### Verify
- [ ] Google Sign-in works via Cognito
- [ ] Auth state persists across page refreshes
- [ ] Guest mode still works
- [ ] Protected API routes validate Cognito tokens
- [ ] Existing user data accessible after migration

---

### Step 6: Real-time Updates → AppSync ⭐⭐⭐⭐ Advanced
**Goal:** Learn GraphQL, WebSocket subscriptions  
**Estimated time:** 6-10 hours  
**Risk:** Medium — optional, can use polling as fallback

#### What to do
- [ ] Create AppSync API with DynamoDB data source
- [ ] Define GraphQL schema for Trip and TripItem
- [ ] Set up real-time subscriptions (onCreateItem, onUpdateTrip)
- [ ] Replace Firestore `onSnapshot` with AppSync subscriptions
- [ ] Update `lib/firestoreUtils.ts` subscription functions

#### Alternative: Simple Polling
If AppSync feels too complex, implement polling as MVP:
- [ ] Replace `onSnapshot` with `setInterval` + fetch every 5 seconds
- [ ] Add `SWR` or `React Query` for smart refetching

#### Files to change
- `lib/firestoreUtils.ts` — Replace `subscribeUserTrips` and `subscribeTripItems`
- `lib/graphql/` (new — AppSync queries, mutations, subscriptions)

#### AWS services to learn
- **AppSync** — Managed GraphQL service
- **GraphQL Subscriptions** — Real-time over WebSocket
- **DynamoDB Streams** — Change data capture

---

## 🧹 Step 7: Cleanup
- [ ] Remove `firebase` package from `package.json`
- [ ] Remove `@vercel/analytics`, `@vercel/speed-insights`
- [ ] Delete `lib/firebase.ts`, `lib/firestoreUtils.ts`, `lib/storageUtils.ts`
- [ ] Delete `firestore.rules`, `storage.rules`, `firebase.json`, `.firebaserc`
- [ ] Update `AGENTS.md` and `README.md` with new architecture
- [ ] Set up billing alerts at $5 and $10

---

## � Post-Migration Enhancements

### Phase 3: Performance & Cost Optimization ⭐⭐ Medium
**Goal:** Optimize for speed, cost, and scale  
**Estimated time:** 2-4 hours per enhancement

#### Performance Improvements
- [ ] **Implement caching**: Add CloudFront caching rules for API responses
- [ ] **Optimize Lambda cold starts**: Use provisioned concurrency for thumbnail Lambda
- [ ] **Database optimization**: Add DynamoDB read/write capacity planning
- [ ] **Image optimization**: Implement WebP conversion and responsive images

#### Cost Optimizations
- [ ] **S3 storage classes**: Move old images to S3 Standard-IA or Glacier
- [ ] **Lambda optimization**: Right-size memory allocation and use ARM64 architecture
- [ ] **CloudFront optimization**: Configure cache behaviors and compression
- [ ] **DynamoDB on-demand**: Switch from provisioned to on-demand pricing

#### Monitoring Enhancements
- [ ] **Set up CloudWatch Dashboards**: Create custom dashboards for app metrics
- [ ] **Add X-Ray tracing**: Enable distributed tracing for Lambda functions
- [ ] **Implement CloudWatch alarms**: Set up alerts for errors and performance issues

---

### Phase 4: Advanced Features ⭐⭐⭐ Advanced
**Goal:** Leverage AWS ecosystem for new capabilities

#### AI/ML Enhancements
- [ ] **Amazon Rekognition**: Auto-tag photos with landmarks, activities
- [ ] **Amazon Comprehend**: Analyze trip descriptions for sentiment and entities
- [ ] **Personalized recommendations**: Use Amazon Personalize for trip suggestions

#### Analytics & Insights
- [ ] **Amazon QuickSight**: Build dashboards for trip spending analytics
- [ ] **AWS Glue + Athena**: Data lake for advanced trip analytics
- [ ] **Amazon Forecast**: Predict future trip expenses based on historical data

#### Global Scale Features
- [ ] **Multi-region deployment**: Deploy to multiple AWS regions for global users
- [ ] **AWS Global Accelerator**: Improve performance for international users
- [ ] **Backup strategy**: Cross-region backups with AWS Backup

---

### Phase 5: Enterprise Features ⭐⭐⭐⭐ Expert
**Goal:** Prepare for business growth

#### Security & Compliance
- [ ] **AWS WAF**: Web application firewall for API protection
- [ ] **AWS Shield**: DDoS protection
- [ ] **AWS Config**: Continuous compliance monitoring
- [ ] **SOC 2 compliance**: Implement security controls

#### Advanced Architecture
- [ ] **Microservices migration**: Split into separate services (auth, trips, media)
- [ ] **Event-driven architecture**: Use EventBridge for inter-service communication
- [ ] **API Gateway**: Unified API management with rate limiting
- [ ] **AWS Step Functions**: Orchestrate complex workflows

#### Business Intelligence
- [ ] **Data warehouse**: Amazon Redshift for advanced analytics
- [ ] **Real-time dashboards**: Amazon OpenSearch for live trip metrics
- [ ] **Machine learning**: Fraud detection for expense claims

---

## 📊 Success Metrics

After migration, track these KPIs:

| Metric | Target | Current (Firebase) |
|--------|--------|-------------------|
| Page Load Time | <2s | ~1.8s |
| API Response Time | <200ms | ~150ms |
| Monthly Cost | <$10 | ~$5 |
| Uptime | 99.9% | 99.95% |
| Error Rate | <0.1% | <0.05% |

---

## 🧹 Maintenance Tasks

### Monthly
- [ ] Review CloudWatch logs and metrics
- [ ] Check billing and usage patterns
- [ ] Update CDK stacks for new features
- [ ] Security patch management

### Quarterly
- [ ] Performance audits and optimizations
- [ ] Cost optimization reviews
- [ ] Backup and disaster recovery testing
- [ ] Dependency updates and security scans

---

## 🎯 Long-term Vision

**Year 1 Goals:**
- 10x user growth (from friend group to small business)
- Multi-tenant architecture
- Mobile app launch (React Native + AWS Amplify)
- Integration with booking platforms (Expedia, Booking.com)

**Year 2 Goals:**
- Enterprise features (team management, approval workflows)
- AI-powered expense categorization
- Global expansion (multi-region, multi-language)
- API marketplace for travel integrations

| Service | Monthly Cost |
|---------|-------------|
| Amplify Hosting | ~$5-7 |
| S3 (5GB) | ~$0.12 |
| CloudFront (10GB) | $0 (free tier) |
| Lambda (~500 invocations) | $0 (free tier) |
| DynamoDB (on-demand) | $0 (free tier) |
| Cognito (<50K MAU) | $0 (free tier) |
| **Total** | **~$5-7/mo** |

> First 12 months with AWS Free Tier: **~$0-2/mo**

---

## 📌 Ground Rules

1. **One step at a time** — Don't start Step N+1 until Step N is verified
2. **Keep Firebase running** — Dual-write during migration, cut over when confident
3. **Set billing alerts** — Before touching any AWS service
4. **Use AWS CDK (TypeScript)** — Infrastructure as code, not click-ops
5. **Git branch per step** — `feat/aws-step-1-amplify`, `feat/aws-step-2-s3`, etc.
