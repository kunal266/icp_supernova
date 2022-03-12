export const idlFactory = ({ IDL }) => {
  const TokenId = IDL.Nat;
  const HttpTemplate = IDL.Record({
    'pattern' : IDL.Text,
    'ctype' : IDL.Text,
    'template' : IDL.Text,
  });
  const HeaderField = IDL.Tuple(IDL.Text, IDL.Text);
  const HttpRequest = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
  });
  const Token = IDL.Record({});
  const StreamingCallbackHttpResponse = IDL.Record({
    'token' : Token,
    'body' : IDL.Vec(IDL.Nat8),
  });
  const StreamingStrategy = IDL.Variant({
    'Callback' : IDL.Record({
      'token' : Token,
      'callback' : IDL.Func([Token], [StreamingCallbackHttpResponse], []),
    }),
  });
  const HttpResponse = IDL.Record({
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HeaderField),
    'streaming_strategy' : IDL.Opt(StreamingStrategy),
    'status_code' : IDL.Nat16,
  });
  const DRC721 = IDL.Service({
    'acceptCycles' : IDL.Func([], [], []),
    'addAdmin' : IDL.Func([IDL.Principal], [IDL.Bool], []),
    'approve' : IDL.Func([IDL.Principal, TokenId], [], []),
    'availableCycles' : IDL.Func([], [IDL.Nat], ['query']),
    'balanceOf' : IDL.Func([IDL.Principal], [IDL.Opt(IDL.Nat)], []),
    'getApproved' : IDL.Func([IDL.Nat], [IDL.Principal], []),
    'getTpl' : IDL.Func([IDL.Text], [HttpTemplate], ['query']),
    'http_request' : IDL.Func([HttpRequest], [HttpResponse], ['query']),
    'init' : IDL.Func([IDL.Nat], [], []),
    'isApprovedForAll' : IDL.Func(
        [IDL.Principal, IDL.Principal],
        [IDL.Bool],
        [],
      ),
    'mint' : IDL.Func([IDL.Nat], [IDL.Vec(IDL.Nat)], []),
    'mintRemain' : IDL.Func([], [IDL.Nat], ['query']),
    'name' : IDL.Func([], [IDL.Text], ['query']),
    'ownerOf' : IDL.Func([TokenId], [IDL.Opt(IDL.Principal)], []),
    'setApprovalForAll' : IDL.Func([IDL.Principal, IDL.Bool], [], ['oneway']),
    'setAssetCanisterUri' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'setTpl' : IDL.Func([IDL.Text, HttpTemplate], [], []),
    'setUriPattern' : IDL.Func([IDL.Text], [IDL.Bool], []),
    'symbol' : IDL.Func([], [IDL.Text], ['query']),
    'tokenURI' : IDL.Func([TokenId], [IDL.Opt(IDL.Text)], ['query']),
    'tokens' : IDL.Func([], [IDL.Vec(TokenId)], ['query']),
    'tokensOf' : IDL.Func([IDL.Principal], [IDL.Vec(TokenId)], ['query']),
    'total' : IDL.Func([], [IDL.Nat], ['query']),
    'transferFrom' : IDL.Func(
        [IDL.Principal, IDL.Principal, IDL.Nat],
        [],
        ['oneway'],
      ),
  });
  return DRC721;
};
export const init = ({ IDL }) => {
  return [IDL.Principal, IDL.Text, IDL.Text];
};
