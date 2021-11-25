/* eslint-disable */
import * as models from '@dehub/shared/models';
import * as Operations from '@dehub/shared/models';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
import { GraphQLModule } from '../graphql.module';

@Injectable({
  providedIn: GraphQLModule,
})
export class TeamMembersService extends Apollo.Query<
  models.TeamMembersQuery,
  models.TeamMembersQueryVariables
> {
  document = models.TeamMembersDocument;

  constructor(apollo: Apollo.Apollo) {
    super(apollo);
  }
}