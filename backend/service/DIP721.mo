import Error "mo:base/Error";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Text "mo:base/Text";
import List "mo:base/List";
import Iter "mo:base/Iter";
import Char "mo:base/Char";
import Cycles "mo:base/ExperimentalCycles";
import T "dip721_types";
import Http "http_types";

actor class DRC721(_minter: Principal, _name : Text, _symbol : Text) {
    private stable var tokenPk : Nat = 0;

    private stable var tokenURIEntries : [(T.TokenId, Text)] = [];
    private stable var ownersEntries : [(T.TokenId, Principal)] = [];
    private stable var balancesEntries : [(Principal, Nat)] = [];
    private stable var tokenApprovalsEntries : [(T.TokenId, Principal)] = [];
    private stable var operatorApprovalsEntries : [(Principal, [Principal])] = [];
    private stable var _templateState : [(Text, HttpTemplate)] = [];

    private let tokenURIs : HashMap.HashMap<T.TokenId, Text> = HashMap.fromIter<T.TokenId, Text>(tokenURIEntries.vals(), 10, Nat.equal, Hash.hash);
    private let owners : HashMap.HashMap<T.TokenId, Principal> = HashMap.fromIter<T.TokenId, Principal>(ownersEntries.vals(), 10, Nat.equal, Hash.hash);
    private let balances : HashMap.HashMap<Principal, Nat> = HashMap.fromIter<Principal, Nat>(balancesEntries.vals(), 10, Principal.equal, Principal.hash);
    private let tokenApprovals : HashMap.HashMap<T.TokenId, Principal> = HashMap.fromIter<T.TokenId, Principal>(tokenApprovalsEntries.vals(), 10, Nat.equal, Hash.hash);
    private let operatorApprovals : HashMap.HashMap<Principal, [Principal]> = HashMap.fromIter<Principal, [Principal]>(operatorApprovalsEntries.vals(), 10, Principal.equal, Principal.hash);
    private let admins : HashMap.HashMap<Principal, Bool> = HashMap.HashMap<Principal, Bool>(0, Principal.equal, Principal.hash);
    private var _template : HashMap.HashMap<Text, HttpTemplate> = HashMap.fromIter(_templateState.vals(), 0, Text.equal, Text.hash);

    private stable var _totalNFT = 0;
    private stable var _assetCanisterUri = "_";
    private stable var _uriPattern = "{{tokenid}}";
    private stable var _mintAssetId : [Nat] = [];

    // Template
    type HttpTemplate = {
            template : Text;
            ctype : Text;
            pattern : Text;
    };

    //  Update func 
    public query func tokensOf(p : Principal) : async [T.TokenId] {
        let ledger = owners.entries();
        var result : [T.TokenId] = [];
        for ((k, v) in ledger) {
            if (v == p) {
                result := Array.append(result, [k]);
            };
        };
        return result;
    };

    public query func tokens() : async [T.TokenId] {
        let ledger = owners.entries();
        var result : [T.TokenId] = [];
        for ((k, v) in ledger) {
            result := Array.append(result, [k]);
        };
        return result;
    };
    //
    public shared func balanceOf(p : Principal) : async ?Nat {
        return balances.get(p);
    };

    public shared func ownerOf(tokenId : T.TokenId) : async ?Principal {
        return _ownerOf(tokenId);
    };

    public shared query func tokenURI(tokenId : T.TokenId) : async ?Text {
        return _tokenURI(tokenId);
    };

    public shared query func name() : async Text {
        return _name;
    };

    public shared query func symbol() : async Text {
        return _symbol;
    };

    public shared query func total() : async Nat {
        return _totalNFT;
    };

    public shared query func mintRemain() : async Nat {
        return _totalNFT - tokenPk;
    };

    public shared func isApprovedForAll(owner : Principal, opperator : Principal) : async Bool {
        return _isApprovedForAll(owner, opperator);
    };

    public shared(msg) func approve(to : Principal, tokenId : T.TokenId) : async () {
        switch(_ownerOf(tokenId)) {
            case (?owner) {
                 assert to != owner;
                 assert msg.caller == owner or _isApprovedForAll(owner, msg.caller);
                 _approve(to, tokenId);
            };
            case (null) {
                throw Error.reject("No owner for token")
            };
        }
    };

    public shared func getApproved(tokenId : Nat) : async Principal {
        switch(_getApproved(tokenId)) {
            case (?v) { return v };
            case null { throw Error.reject("None approved")}
        }
    };

    public shared(msg) func setApprovalForAll(op : Principal, isApproved : Bool) : () {
        assert msg.caller != op;

        switch (isApproved) {
            case true {
                switch (operatorApprovals.get(msg.caller)) {
                    case (?opList) {
                        var array = Array.filter<Principal>(opList,func (p) { p != op });
                        array := Array.append<Principal>(array, [op]);
                        operatorApprovals.put(msg.caller, array);
                    };
                    case null {
                        operatorApprovals.put(msg.caller, [op]);
                    };
                };
            };
            case false {
                switch (operatorApprovals.get(msg.caller)) {
                    case (?opList) {
                        let array = Array.filter<Principal>(opList, func(p) { p != op });
                        operatorApprovals.put(msg.caller, array);
                    };
                    case null {
                        operatorApprovals.put(msg.caller, []);
                    };
                };
            };
        };
        
    };

    public shared(msg) func transferFrom(from : Principal, to : Principal, tokenId : Nat) : () {
        assert _isApprovedOrOwner(msg.caller, tokenId);

        _transfer(from, to, tokenId);
    };

    public shared(msg) func mint(n : Nat) : async [Nat] {
        if ((tokenPk + n) > _totalNFT) {
            return [0];
        };
        var i = n;
        var result : [Nat] = [];
        while (i > 0) {
            let assetIndex = _mintAssetId[tokenPk];
            let uri : Text = _buildNFTUri(_assetCanisterUri, assetIndex);
            _mint(msg.caller, assetIndex, uri);
            result := Array.append(result, [assetIndex]);
            tokenPk += 1;
            i -= 1;
        };
        return result;
    };


    // Internal

    private func _ownerOf(tokenId : T.TokenId) : ?Principal {
        return owners.get(tokenId);
    };

    private func _tokenURI(tokenId : T.TokenId) : ?Text {
        return tokenURIs.get(tokenId);
    };

    private func _isApprovedForAll(owner : Principal, opperator : Principal) : Bool {
        switch (operatorApprovals.get(owner)) {
            case(?whiteList) {
                for (allow in whiteList.vals()) {
                    if (allow == opperator) {
                        return true;
                    };
                };
            };
            case null {return false;};
        };
        return false;
    };

    private func _approve(to : Principal, tokenId : Nat) : () {
        tokenApprovals.put(tokenId, to);
    };

    private func _removeApprove(tokenId : Nat) : () {
        let _ = tokenApprovals.remove(tokenId);
    };

    private func _exists(tokenId : Nat) : Bool {
        return Option.isSome(owners.get(tokenId));
    };

    private func _getApproved(tokenId : Nat) : ?Principal {
        assert _exists(tokenId) == true;
        switch(tokenApprovals.get(tokenId)) {
            case (?v) { return ?v };
            case null {
                return null;
            };
        }
    };

    private func _hasApprovedAndSame(tokenId : Nat, spender : Principal) : Bool {
        switch(_getApproved(tokenId)) {
            case (?v) {
                return v == spender;
            };
            case null { return false}
        }
    };

    private func _isApprovedOrOwner(spender : Principal, tokenId : Nat) : Bool {
        assert _exists(tokenId);
        let owner = Option.unwrap(_ownerOf(tokenId));
        return spender == owner or _hasApprovedAndSame(tokenId, spender) or _isApprovedForAll(owner, spender);
    };

    private func _transfer(from : Principal, to : Principal, tokenId : Nat) : () {
        assert _exists(tokenId);
        assert Option.unwrap(_ownerOf(tokenId)) == from;

        // Bug in HashMap https://github.com/dfinity/motoko-base/pull/253/files
        // this will throw unless you patch your file
        _removeApprove(tokenId);

        _decrementBalance(from);
        _incrementBalance(to);
        owners.put(tokenId, to);
    };

    private func _incrementBalance(address : Principal) {
        switch (balances.get(address)) {
            case (?v) {
                balances.put(address, v + 1);
            };
            case null {
                balances.put(address, 1);
            }
        }
    };

    private func _decrementBalance(address : Principal) {
        switch (balances.get(address)) {
            case (?v) {
                balances.put(address, v - 1);
            };
            case null {
                balances.put(address, 0);
            }
        }
    };

    private func _mint(to : Principal, tokenId : Nat, uri : Text) : () {
        assert not _exists(tokenId);

        _incrementBalance(to);
        owners.put(tokenId, to);
        tokenURIs.put(tokenId,uri)
    };

    private func _burn(tokenId : Nat) {
        let owner = Option.unwrap(_ownerOf(tokenId));

        _removeApprove(tokenId);
        _decrementBalance(owner);

        ignore owners.remove(tokenId);
    };

    system func preupgrade() {
        tokenURIEntries := Iter.toArray(tokenURIs.entries());
        ownersEntries := Iter.toArray(owners.entries());
        balancesEntries := Iter.toArray(balances.entries());
        tokenApprovalsEntries := Iter.toArray(tokenApprovals.entries());
        operatorApprovalsEntries := Iter.toArray(operatorApprovals.entries());
        _templateState := Iter.toArray(_template.entries());
        
    };

    system func postupgrade() {
        tokenURIEntries := [];
        ownersEntries := [];
        balancesEntries := [];
        tokenApprovalsEntries := [];
        operatorApprovalsEntries := [];
        _templateState := [];
    };

    public shared(msg) func init(total : Nat) : async () {
        assert((msg.caller == _minter) or _isAdmin(msg.caller));
        _totalNFT := total;
        // init array
        let assetArr = Array.tabulateVar<Nat>(_totalNFT, func (index) : Nat {
            return index + 1;
        });
        // random asset
        var i = 0;
        while (i < _totalNFT) {
            _shuffle(assetArr, _totalNFT);
            i += 1;
        };
        //
        _mintAssetId := Array.freeze(assetArr);
    };

    private func _shuffle(assetArr : [var Nat], total : Nat) : () {
        var x : Nat = 64;
        var y : Nat = total - x;

        var xJump = 1;
        var yJump = 2;

        while (x < total and y > 0) {
            _swap(assetArr, x, y);
            x += xJump;
            if (yJump > y) {
                y := total - 64;
            };
            y -= yJump;

            xJump += 2;
            yJump += 1;
        };

        x := 32;
        y := total - x;

        xJump := 3;
        yJump := 5;
        while (x < total and y > 0) {
            _swap(assetArr, x, y);
            x += xJump;
            if (yJump > y) {
                y := total - 32;
            };
            y -= yJump;

            xJump += 1;
            yJump += 1;
        };

        x := 128;
        y := total - x;

        xJump := 1;
        yJump := 4;
        while (x < total and y > 0) {
            _swap(assetArr, x, y);
            x += xJump;
            if (yJump > y) {
                y := total - 128;
            };
            y -= yJump;

            xJump += 2;
            yJump += 1;
        };

        x := 0;
        y := total / 2;

        while (y < total) {
            _swap(assetArr, x, y);
            x += 1;
            y += 1;
        };
    };

    private func _swap(arr : [var Nat], i : Nat, j : Nat) : () {
        let temp = arr[i];
        arr[i] := arr[j];
        arr[j] := temp;
    };

    private func _buildNFTUri(uri : Text, tokenid : Nat) : Text {
        let result = Text.replace(_assetCanisterUri, #text(_uriPattern), Nat.toText(tokenid));
        return result;
    };

    public shared(msg) func setUriPattern(p : Text) : async Bool {
        assert((msg.caller == _minter) or _isAdmin(msg.caller));
        _uriPattern := p;
        assert(_uriPattern == p);
        return true;
    };

    public shared(msg) func setAssetCanisterUri(uri : Text) : async Bool {
        assert((msg.caller == _minter) or _isAdmin(msg.caller));
        _assetCanisterUri := uri;
        assert(_assetCanisterUri == uri);
        let tokensUri = tokenURIs.entries();
        for ((k, v) in tokensUri) {
            let tokenUri = _buildNFTUri(_assetCanisterUri, k);
            tokenURIs.put(k, tokenUri);
        };
        return true;
    };

    private func _isAdmin(principal : Principal) : Bool {
        let value = admins.get(principal);
        switch (value) {
            case (?isAdmin) return isAdmin;
            case (null) return false;
        };
    };

    public shared(msg) func addAdmin(principal : Principal) : async Bool {
        assert(msg.caller == _minter);
        admins.put(principal, true);
        return _isAdmin(principal);
    };

    //// Http

    //Internal cycle management - good general case
    public func acceptCycles() : async () {
        let available = Cycles.available();
        let accepted = Cycles.accept(available);
        assert (accepted == available);
    };
    public query func availableCycles() : async Nat {
        return Cycles.balance();
    };

    public shared(msg) func setTpl(key : Text, template : HttpTemplate) : async () {
        assert((msg.caller == _minter) or _isAdmin(msg.caller));
        _template.put(key, template);
    };

    public query(msg) func getTpl(key : Text) : async HttpTemplate {
        assert((msg.caller == _minter) or _isAdmin(msg.caller));
        return Option.unwrap(_template.get(key));
    };
    // Http 
    public query func http_request(request : Http.HttpRequest) : async Http.HttpResponse {
        let token = Option.get(_getParam(request.url, "tokenid"), "");
        let tokenid : Nat = Nat32.toNat(_textToNat32(token));
        if (tokenid == 0 or tokenid > _totalNFT) {
            {
                status_code = 200;
                headers = [("content-type", "text/plain")];
                body = Text.encodeUtf8 (
                "Cycle Balance:   ~" # debug_show (Cycles.balance()/1000000000000) # "T\n"
                );
                streaming_strategy = null;
            };
        } else {
            let templateType = Option.get(_getParam(request.url, "type"), "");
            let httpTemplate : HttpTemplate = Option.unwrap(_template.get(templateType));

            let tokenUri = tokenURIs.get(tokenid);
            switch (tokenUri) {
                case (?uri) {
                    let assetUrl = Text.replace(uri, #text("ic0.app"), "raw.ic0.app");
                    let templateData = Text.replace(httpTemplate.template, #text(httpTemplate.pattern), assetUrl);
                    {
                        status_code = 200;
                        headers = [("Content-Type", httpTemplate.ctype)];
                        body = Text.encodeUtf8(templateData);
                        streaming_strategy = null;
                    };
                };
                case (null) {
                    _buildNotFoundHttpResponseWithBodyText("Not mint");
                };
            };
        };
    };

    private func _buildNotFoundHttpResponseWithBodyText(err: Text) : Http.HttpResponse {
        {
            status_code = 404;
            headers = [];
            body = Text.encodeUtf8(err);
            streaming_strategy = null;
        };
    };

    private func _textToNat32(t : Text) : Nat32 {
        var reversed : [Nat32] = [];
        for(c in t.chars()) {
            assert(Char.isDigit(c));
            reversed := Array.append([Char.toNat32(c)-48], reversed);
        };
        var total : Nat32 = 0;
        var place : Nat32  = 1;
        for(v in reversed.vals()) {
            total += (v * place);
            place := place * 10;
        };
        total;
    };

    private func _getParam(url : Text, param : Text) : ?Text {
        var _s : Text = url;
        Iter.iterate<Text>(Text.split(_s, #text("/")), func(x, _i) {
            _s := x;
        });
        Iter.iterate<Text>(Text.split(_s, #text("?")), func(x, _i) {
            if (_i == 1) _s := x;
        });
        var t : ?Text = null;
        var found : Bool = false;
        Iter.iterate<Text>(Text.split(_s, #text("&")), func(x, _i) {
            if (found == false) {
                Iter.iterate<Text>(Text.split(x, #text("=")), func(y, _ii) {
                    if (_ii == 0) {
                        if (Text.equal(y, param)) found := true;
                    } else if (found == true) t := ?y;
                });
            };
        });
        return t;
    };
};